import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

export enum Severity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

interface SummarizeArticleResponse {
  articleId: string;
  summary: string;
  originalLength: number;
  summaryLength: number;
}

interface TranslateArticleResponse {
  articleId: string;
  translatedText: string;
  detectedLanguage: string;
}

interface AnalyzeArticleResponse {
  articleId: string;
  analysis: string;
  suggestions: string[];
  severity: Severity;
}

interface GenerateResponse {
  text: string;
}

export class SummarizeArticleEntity implements SummarizeArticleResponse {
  @ApiProperty({ example: randomUUID() })
  articleId!: string;

  @ApiProperty({ example: 'summary' })
  summary!: string;

  @ApiProperty({ example: 'originalLength' })
  originalLength!: number;

  @ApiProperty({ example: 'summaryLength' })
  summaryLength!: number;
}

export class TranslateArticleEntity implements TranslateArticleResponse {
  @ApiProperty({ example: randomUUID() })
  articleId!: string;

  @ApiProperty({ example: 'translatedText' })
  translatedText!: string;

  @ApiProperty({ example: 'detectedLanguage' })
  detectedLanguage!: string;
}

export class AnalyzeArticleEntity implements AnalyzeArticleResponse {
  @ApiProperty({ example: randomUUID() })
  articleId!: string;

  @ApiProperty({ example: 'analysis' })
  analysis!: string;

  @ApiProperty({ example: ['suggestions1', 'suggestions2'], type: [String] })
  suggestions!: string[];

  @ApiProperty({ enum: Severity, default: Severity.INFO })
  severity!: Severity;
}

export class GenerateEntity implements GenerateResponse {
  @ApiProperty({ example: 'generated text' })
  text!: string;
}
