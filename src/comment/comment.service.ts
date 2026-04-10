import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PRISMA_ERROR_CODES } from 'src/prisma/prisma-error-codes';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    return comment;
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
      return await this.prisma.comment.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT) {
          const target = (error.meta?.field_name as string) || '';

          if (target.includes('authorId')) {
            throw new NotFoundException(
              `User with id ${dto.authorId} does not exist`,
            );
          }

          if (target.includes('articleId')) {
            throw new NotFoundException(
              `Article with id ${dto.articleId} does not exist`,
            );
          }

          throw new NotFoundException('Related record not found');
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
