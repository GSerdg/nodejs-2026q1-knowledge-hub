import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GeminiService } from './services/gemini.service';
import { SummarizeArticleEntity } from './entities/ai-responses.entity';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { UsageTrackerService } from './services/usage-tracker.service';

@ApiTags('ai')
@ApiBearerAuth('access-token')
@Controller('ai')
export class AiController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly usageTracker: UsageTrackerService,
  ) {}

  @Post('articles/:articleId/summarize')
  @ApiOperation({ summary: 'Summarize Article' })
  @ApiParam({ name: 'articleId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'article summarized',
    type: SummarizeArticleEntity,
  })
  @ApiResponse({ status: 404, description: 'Article does not exist' })
  async summarize(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() summarizeData: SummarizeArticleDto,
  ) {
    this.usageTracker.increment('summarize');

    return await this.geminiService.summarize(prompt);
  }
}
