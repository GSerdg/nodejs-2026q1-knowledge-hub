import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RagService } from './services/rag.service';
import {
  ReindexRequestDto,
  RagSearchRequestDto,
  RagChatRequestDto,
} from './dto/rag.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import {
  RagChatResponseEntity,
  RagSearchResponseEntity,
  ReindexEntity,
} from './entities/rag-responses.entity';

@ApiTags('ai/rag')
@ApiBearerAuth('access-token')
@Controller('ai/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Public()
  @Post('index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Index Knowledge Hub data' })
  @ApiResponse({
    status: 200,
    description: 'data indexed',
    type: ReindexEntity,
  })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async reindex(@Body() body: ReindexRequestDto) {
    return await this.ragService.indexArticles(body);
  }

  @Public()
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Semantic search in Knowledge Hub' })
  @ApiResponse({
    status: 200,
    description: 'searching is success',
    type: RagSearchResponseEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async search(
    @Body() body: RagSearchRequestDto,
  ): Promise<RagSearchResponseEntity> {
    return await this.ragService.search(body);
  }

  @Public()
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chat with Knowledge Hub RAG' })
  @ApiResponse({
    status: 200,
    description: 'chat response',
    type: RagChatResponseEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async chat(@Body() body: RagChatRequestDto): Promise<RagChatResponseEntity> {
    return await this.ragService.chat(body);
  }

  @Delete('index/articles/:articleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete article from index' })
  @ApiResponse({
    status: 204,
    description: 'article deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'article/index entries are not found',
  })
  async deleteArticleIndex(
    @Param('articleId') articleId: string,
  ): Promise<void> {
    await this.ragService.deleteArticleFromIndex(articleId);
  }
}
