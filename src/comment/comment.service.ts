import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InMemoryDbService } from 'src/db/in-memory-db.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(private readonly db: InMemoryDbService) {}

  findById(id: string) {
    const comment = this.db.comments.find((comment) => comment.id === id);

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    return comment;
  }

  findAllByArticleId(articleId: string) {
    const comments = this.db.comments.filter(
      (comment) => comment.articleId === articleId,
    );

    return comments;
  }

  create(dto: CreateCommentDto) {
    const id = randomUUID();
    const createdAt = Date.now();

    if (!this.db.articles.some((article) => article.id === dto.articleId)) {
      throw new UnprocessableEntityException(
        `Article with id ${dto.articleId} does not exist`,
      );
    }

    const commentData: Comment = {
      id,
      createdAt,
      authorId: null,
      ...dto,
    };

    this.db.comments.push(commentData);

    return commentData;
  }

  delete(id: string) {
    const commentIndex = this.db.comments.findIndex(
      (comment) => comment.id === id,
    );

    if (commentIndex === -1) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    this.db.comments.splice(commentIndex, 1);
  }
}
