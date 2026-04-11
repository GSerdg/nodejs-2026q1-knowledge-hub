import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ArticleQueryDto } from './dto/article-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PRISMA_ERROR_CODES } from 'src/prisma/prisma-error-codes';
import { convertTimestamp } from 'src/utils/convertTimestamp';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ArticleQueryDto) {
    const { status, categoryId, tag } = query;

    const articles = await this.prisma.article.findMany({
      where: {
        status,
        categoryId,
        tags: tag
          ? {
              some: {
                name: tag,
              },
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    return convertTimestamp(articles).map((art: any) => ({
      ...art,
      tags: art.tags.map((t: any) => t.name),
    }));
  }

  async findById(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    const converted = convertTimestamp(article);

    return {
      ...converted,
      tags: converted.tags.map((t: any) => t.name),
    };
  }

  async create(dto: CreateArticleDto) {
    const data: Prisma.ArticleUncheckedCreateInput = {
      ...dto,
      authorId: dto.authorId ?? null,
      categoryId: dto.categoryId ?? null,
      tags: {
        connectOrCreate:
          dto.tags?.map((name) => ({
            where: { name },
            create: { name },
          })) || [],
      },
    };

    const article = await this.prisma.article.create({
      data,
      include: {
        tags: true,
      },
    });

    const converted = convertTimestamp(article);

    return {
      ...converted,
      tags: converted.tags.map((t: any) => t.name),
    };
  }

  async update(id: string, dto: UpdateArticleDto) {
    try {
      const data: Prisma.ArticleUncheckedUpdateInput = {
        ...dto,
        tags: {
          connectOrCreate:
            dto.tags?.map((name) => ({
              where: { name },
              create: { name },
            })) || [],
        },
      };

      const article = await this.prisma.article.update({
        where: { id },
        data,
        include: {
          tags: true,
        },
      });

      const converted = convertTimestamp(article);

      return {
        ...converted,
        tags: converted.tags.map((t: any) => t.name),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.NOT_FOUND) {
          throw new NotFoundException(`Article with id ${id} not found`);
        }
      }

      throw error;
    }
  }

  async delete(id: string) {
    try {
      const article = await this.prisma.article.delete({
        where: { id },
        include: {
          tags: true,
        },
      });

      const converted = convertTimestamp(article);

      return {
        ...converted,
        tags: converted.tags.map((t: any) => t.name),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.NOT_FOUND) {
          throw new NotFoundException(`Article with id ${id} not found`);
        }
      }

      throw error;
    }
  }
}
