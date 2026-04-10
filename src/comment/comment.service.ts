import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PRISMA_ERROR_CODES } from 'src/prisma/prisma-error-codes';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { convertTimestamp } from 'src/utils/convertTimestamp';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    return convertTimestamp(comment);
  }

  async findAllByArticleId(articleId: string) {
    return await this.prisma.comment.findMany({ where: { articleId } });
  }

  async create(dto: CreateCommentDto) {
    try {
      const data: Prisma.CommentUncheckedCreateInput = {
        ...dto,
        authorId: dto.authorId ?? null,
      };
      const comment = await this.prisma.comment.create({ data });

      return convertTimestamp(comment);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT) {
          const target = (error.meta?.field_name as string) || '';

          if (target.includes('authorId')) {
            throw new UnprocessableEntityException(
              `User with id ${dto.authorId} does not exist`,
            );
          }

          if (target.includes('articleId')) {
            throw new UnprocessableEntityException(
              `Article with id ${dto.articleId} does not exist`,
            );
          }

          throw new UnprocessableEntityException('Related record not found');
        }
      }

      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.comment.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.NOT_FOUND) {
          throw new NotFoundException(`Comment with id ${id} not found`);
        }
      }

      throw error;
    }
  }
}
