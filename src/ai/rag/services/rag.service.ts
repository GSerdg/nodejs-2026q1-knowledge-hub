import { Injectable } from '@nestjs/common';
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

@Injectable()
export class RagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chunkingService: ChunkingService,
    private readonly googleAi: GoogleAiService,
    private readonly vectorDb: VectorDbService,
  ) {}

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
    const queryVector = await this.googleAi.getEmbedding(params.query);

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
    const searchData = await this.search({ query: params.question, limit: 5 });

    if (searchData.results.length === 0) {
      return {
        answer:
          "I'm sorry, I couldn't find any relevant information in the knowledge base.",
        sources: [],
        conversationId: params.conversationId || crypto.randomUUID(),
      };
    }

    const context = searchData.results
      .map((r) => `Source: ${r.articleTitle}\nContent: ${r.chunk}`)
      .join('\n\n');

    const answer = await this.googleAi.generateRagAnswer(
      params.question,
      context,
    );

    return {
      answer,
      sources: searchData.results.map((r) => ({
        articleId: r.articleId,
        articleTitle: r.articleTitle,
        relevantChunk: r.chunk,
      })),
      conversationId: params.conversationId || crypto.randomUUID(),
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
}
