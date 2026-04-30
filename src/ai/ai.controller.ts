import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ArticleService } from 'src/article/article.service';
import { Public } from 'src/common/decorators/public.decorator';
import { AnalyzeArticleDto } from './dto/analyze-article.dto';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { TranslateArticleDto } from './dto/translate-article.dto';
import {
  AnalyzeArticleEntity,
  Severity,
  SummarizeArticleEntity,
  TranslateArticleEntity,
} from './entities/ai-responses.entity';
import { ArticlePrompts } from './prompts/article-prompts';
import { GeminiService } from './services/gemini.service';
import { UsageTrackerService } from './services/usage-tracker.service';

@ApiTags('ai')
@ApiBearerAuth('access-token')
@Controller('ai')
@UseGuards(ThrottlerGuard)
export class AiController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly articleService: ArticleService,
    private readonly usageTracker: UsageTrackerService,
  ) {}

  @Public()
  @Post('articles/:articleId/summarize')
  @HttpCode(200)
  @ApiOperation({ summary: 'Summarize Article' })
  @ApiParam({ name: 'articleId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'article summarized',
    type: SummarizeArticleEntity,
  })
  @ApiResponse({ status: 404, description: 'Article does not exist' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async summarize(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() summarizeDto: SummarizeArticleDto,
  ): Promise<SummarizeArticleEntity> {
    this.usageTracker.increment('summarize');

    const article = await this.articleService.findById(articleId);

    const prompt = ArticlePrompts.summarize(
      article.content,
      summarizeDto.maxLength,
    );

    const summary = await this.geminiService.generateText(prompt);

    return {
      articleId,
      summary: summary ?? '',
      originalLength: article.content.length,
      summaryLength: summary?.length ?? 0,
    };
  }

  @Public()
  @Post('articles/:articleId/translate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Translate Article' })
  @ApiParam({ name: 'articleId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'article translated',
    type: TranslateArticleEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Article does not exist' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async translate(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() translateDto: TranslateArticleDto,
  ): Promise<TranslateArticleEntity> {
    this.usageTracker.increment('translate');

    const article = await this.articleService.findById(articleId);

    const prompt = ArticlePrompts.translate(
      article.content,
      translateDto.targetLanguage,
      translateDto.sourceLanguage,
    );

    const translate = await this.geminiService.generateText(prompt);
    const cleanJsonTranslate =
      translate?.replace(/```json|```/g, '').trim() ?? '';

    try {
      const parsed = JSON.parse(cleanJsonTranslate);

      return {
        articleId,
        translatedText: parsed.translatedText ?? '',
        detectedLanguage:
          parsed.detectedLanguage ?? translateDto.sourceLanguage ?? 'unknown',
      };
    } catch {
      return {
        articleId,
        translatedText: cleanJsonTranslate,
        detectedLanguage: translateDto.sourceLanguage || 'detected_by_ai',
      };
    }
  }

  @Public()
  @Post('articles/:articleId/analyze')
  @HttpCode(200)
  @ApiOperation({ summary: 'Analyze Article Content' })
  @ApiParam({ name: 'articleId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'article analyzed',
    type: AnalyzeArticleEntity,
  })
  @ApiResponse({ status: 404, description: 'Article does not exist' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async analyze(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() analyzeDto: AnalyzeArticleDto,
  ): Promise<AnalyzeArticleEntity> {
    this.usageTracker.increment('analyze');

    const article = await this.articleService.findById(articleId);

    const prompt = ArticlePrompts.analyze(article.content, analyzeDto.task);

    const analyze = await this.geminiService.generateText(prompt);
    const cleanJsonAnalyze = analyze?.replace(/```json|```/g, '').trim() ?? '';

    try {
      const parsed = JSON.parse(cleanJsonAnalyze ?? '');

      return {
        articleId,
        analysis: parsed.analysis ?? '',
        suggestions: parsed.suggestions ?? [],
        severity: parsed.severity ?? '',
      };
    } catch {
      return {
        articleId,
        analysis: cleanJsonAnalyze,
        suggestions: [],
        severity: Severity.INFO,
      };
    }
  }
}
