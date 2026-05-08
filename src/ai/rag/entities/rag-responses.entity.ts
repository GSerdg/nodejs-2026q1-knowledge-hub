import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

interface ReindexResponse {
  indexedArticles: number;
  indexedChunks: number;
  vectorCollection: string;
}

interface RagSearchResult {
  articleId: string;
  articleTitle: string;
  chunk: string;
  similarity: number;
}
interface RagSearchResponse {
  results: Array<{
    articleId: string;
    articleTitle: string;
    chunk: string;
    similarity: number;
  }>;
}

interface RagChatSource {
  articleId: string;
  articleTitle: string;
  relevantChunk: string;
}

interface RagChatResponse {
  answer: string;
  sources: Array<{
    articleId: string;
    articleTitle: string;
    relevantChunk: string;
  }>;
  conversationId: string;
}

export class ReindexEntity implements ReindexResponse {
  @ApiProperty({ example: 1 })
  indexedArticles!: number;

  @ApiProperty({ example: 5 })
  indexedChunks!: number;

  @ApiProperty({ example: 'vectorCollection' })
  vectorCollection!: string;
}

export class RagSearchResultEntity implements RagSearchResult {
  @ApiProperty({ example: randomUUID() })
  articleId!: string;

  @ApiProperty({ example: 'articleTitle' })
  articleTitle!: string;

  @ApiProperty({ example: 'chunk' })
  chunk!: string;

  @ApiProperty({ example: 0.8 })
  similarity!: number;
}

export class RagSearchResponseEntity implements RagSearchResponse {
  @ApiProperty({
    type: [RagSearchResultEntity],
    description: 'List of founds relevant fragments',
  })
  results!: RagSearchResultEntity[];
}

export class RagChatSourceEntity implements RagChatSource {
  @ApiProperty({ example: randomUUID() })
  articleId!: string;

  @ApiProperty({ example: 'articleTitle' })
  articleTitle!: string;

  @ApiProperty({ example: 'relevantChunk' })
  relevantChunk!: string;
}

export class RagChatResponseEntity implements RagChatResponse {
  @ApiProperty({ example: 'answer' })
  answer!: string;

  @ApiProperty({
    type: [RagChatSourceEntity],
    description: 'source attribution',
  })
  sources!: RagChatSourceEntity[];

  @ApiProperty({ example: randomUUID() })
  conversationId!: string;
}
