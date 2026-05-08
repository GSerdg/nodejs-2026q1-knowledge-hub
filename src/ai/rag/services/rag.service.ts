import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChunkingService } from './chunking.service';
import { GoogleAiService } from './google-ai.service';
import { VectorDbService } from './vector-db.service';
import {
  ReindexRequestDto,
  RagSearchRequestDto,
  RagChatRequestDto,
} from '../dto/rag.dto';
import { NotFoundError } from 'src/common/errors/custom-error';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RagService {
  private readonly maxMessages: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly chunkingService: ChunkingService,
    private readonly googleAi: GoogleAiService,
    private readonly vectorDb: VectorDbService,
  ) {
    this.maxMessages = Number(
      this.configService.get('RAG_CONVERSATION_MAX_MESSAGES', 20),
    );
  }

  async indexArticles(params: ReindexRequestDto) {
    const { onlyPublished = true, articleIds } = params;

    const articles = await this.prisma.article.findMany({
      where: {
        ...(onlyPublished ? { status: 'published' } : {}),
        ...(articleIds?.length ? { id: { in: articleIds } } : {}),
      },
      include: { tags: true },
    });

    let totalChunks = 0;

    for (const article of articles) {
      await this.vectorDb.deleteByArticleId(article.id);

      const content = `${article.title}\n\n${article.content}`;
      const chunks = await this.chunkingService.splitText(content);

      for (const chunk of chunks) {
        const vector = await this.googleAi.getEmbedding(chunk);

        await this.vectorDb.upsertPoint({
          id: crypto.randomUUID(),
          vector,
          payload: {
            articleId: article.id,
            articleTitle: article.title,
            chunk,
            status: article.status,
            categoryId: article.categoryId,
            tags: article.tags.map((t) => t.name),
          },
        });

        totalChunks++;
      }
    }

    return {
      indexedArticles: articles.length,
      indexedChunks: totalChunks,
      vectorCollection: this.vectorDb.getCollectionName(),
    };
  }

  async search(params: RagSearchRequestDto) {
    const queryVector = await this.googleAi.getEmbedding(params.query, true);

    const filter: any = { must: [] };
    if (params.articleStatus) {
      filter.must.push({
        key: 'status',
        match: { value: params.articleStatus },
      });
    }
    if (params.categoryId) {
      filter.must.push({
        key: 'categoryId',
        match: { value: params.categoryId },
      });
    }
    if (params.tags?.length) {
      filter.must.push({ key: 'tags', array: { has_any: params.tags } });
    }

    const searchResults = await this.vectorDb.search(
      queryVector,
      filter.must.length ? filter : undefined,
      params.limit,
    );

    return {
      results: searchResults.map((res) => ({
        articleId: res.payload?.articleId as string,
        articleTitle: res.payload?.articleTitle as string,
        chunk: res.payload?.chunk as string,
        similarity: res.score,
      })),
    };
  }

  async chat(params: RagChatRequestDto) {
    const conversationId = params.conversationId || crypto.randomUUID();

    const historyKey = `chat_history_${conversationId}`;
    let history = (await this.cacheManager.get<string[]>(historyKey)) || [];

    const searchData = await this.search({ query: params.question, limit: 5 });
    const context = searchData.results
      .map(
        (result) => `Source: ${result.articleTitle}\nContent: ${result.chunk}`,
      )
      .join('\n\n');

    const answer = await this.googleAi.generateRagAnswer(
      params.question,
      context,
      history,
    );

    history.push(`User: ${params.question}`, `AI: ${answer}`);

    if (history.length > this.maxMessages) {
      history = history.slice(-this.maxMessages);
    }

    await this.cacheManager.set(historyKey, history);

    return {
      answer,
      sources: searchData.results.map((r) => ({
        articleId: r.articleId,
        articleTitle: r.articleTitle,
        relevantChunk: r.chunk,
      })),
      conversationId,
    };
  }

  async deleteArticleFromIndex(articleId: string) {
    const exists = await this.vectorDb.existsByArticleId(articleId);

    if (!exists) {
      throw new NotFoundError(
        `Article with ID ${articleId} not found in vector index`,
      );
    }

    await this.vectorDb.deleteByArticleId(articleId);
  }

  async getConversationHistory(conversationId: string) {
    const history = await this.cacheManager.get<string[]>(
      `chat_history_${conversationId}`,
    );

    if (!history) throw new NotFoundError('History not found');

    return { conversationId, history };
  }
}
