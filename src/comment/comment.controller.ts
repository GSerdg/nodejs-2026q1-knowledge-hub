import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments.dto';
import { CommentEntity } from './entities/comment.entity';

@ApiTags('comment')
@ApiBearerAuth('access-token')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all comments for an article' })
  @ApiResponse({
    status: 200,
    description: 'Return all comments for the given article',
    type: [CommentEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'articleId query parameter is required and must be UUID',
  })
  async findAllByArticleId(@Query() query: GetCommentsQueryDto) {
    const { articleId } = query;

    return await this.commentService.findAllByArticleId(articleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single comment by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Return the comment record',
    type: CommentEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return await this.commentService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new comment' })
  @ApiResponse({
    status: 201,
    description: 'Comment created',
    type: CommentEntity,
  })
  @ApiResponse({ status: 400, description: 'Missing required fields' })
  @ApiResponse({
    status: 422,
    description: 'Article with provided articleId does not exist',
  })
  async create(@Body() commentData: CreateCommentDto) {
    return await this.commentService.create(commentData);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete comment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Comment deleted' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return await this.commentService.delete(id);
  }
}
