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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.commentService.findById(id);
  }

  @Get()
  async findAllByArticleId(@Query() query: GetCommentsQueryDto) {
    const { articleId } = query;

    return this.commentService.findAllByArticleId(articleId);
  }

  @Post()
  async create(@Body() commentData: CreateCommentDto) {
    return this.commentService.create(commentData);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    this.commentService.delete(id);
  }
}
