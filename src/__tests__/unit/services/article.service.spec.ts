import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock, resetPrismaMock } from 'src/__tests__/prisma-mock';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, Status } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PRISMA_ERROR_CODES } from 'src/prisma/prisma-error-codes';
import { ArticleService } from 'src/article/article.service';
import { CreateArticleDto } from 'src/article/dto/create-article.dto';
import { UpdateArticleDto } from 'src/article/dto/update-article.dto';

describe('ArticleService', () => {
  let articleService: ArticleService;

  const mockArticle = {
    id: 'testId',
    createdAt: new Date(),
    updatedAt: new Date(),
    content: 'test content',
    authorId: 'authorId',
    title: 'test title',
    status: Status.draft,
    categoryId: null,
    tags: ['tag1'],
  };
  const articleId = 'testId';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    articleService = module.get<ArticleService>(ArticleService);
    resetPrismaMock();
  });

  it('should be defined', () => {
    expect(articleService).toBeDefined();
  });

  describe('find all articles', () => {
    it('should return articles', async () => {
      prismaMock.article.findMany.mockResolvedValue([mockArticle, mockArticle]);

      const result = await articleService.findAll({});

      expect(result).toBeInstanceOf(Array);
      expect(typeof result[0].createdAt).toBe('number');
    });

    it('should find articles width query', async () => {
      const mockQuery = {
        status: Status.draft,
        categoryId: 'testId',
        tag: 'tag',
      };
      prismaMock.article.findMany.mockResolvedValue([mockArticle, mockArticle]);

      await articleService.findAll(mockQuery);

      expect(prismaMock.article.findMany).toHaveBeenLastCalledWith({
        where: {
          status: mockQuery.status,
          categoryId: mockQuery.categoryId,
          tags: {
            some: {
              name: mockQuery.tag,
            },
          },
        },
        include: {
          tags: true,
        },
      });
    });
  });

  describe('find article by id', () => {
    it('should return article', async () => {
      prismaMock.article.findUnique.mockResolvedValue(mockArticle);

      await articleService.findById(articleId);

      expect(prismaMock.article.findUnique).toHaveBeenLastCalledWith({
        where: { id: articleId },
        include: {
          tags: true,
        },
      });
    });

    it('should respond 404 if article not found', async () => {
      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(articleService.findById(articleId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(articleService.findById(articleId)).rejects.toThrow(
        `Article with id ${articleId} not found`,
      );
    });
  });

  describe('create article', () => {
    const createArticleDto: CreateArticleDto = {
      title: 'test title',
      content: 'content',
    };

    it('should create article and return', async () => {
      prismaMock.article.create.mockResolvedValue(mockArticle);

      const result = await articleService.create(createArticleDto);

      expect(prismaMock.article.create).toHaveBeenLastCalledWith({
        data: {
          ...createArticleDto,
          authorId: null,
          categoryId: null,
          tags: { connectOrCreate: [] },
        },
        include: {
          tags: true,
        },
      });
      expect(result.title).toBe(createArticleDto.title);
    });
  });

  describe('update article', () => {
    const updateArticleDto: UpdateArticleDto = {
      title: 'test title update',
      content: 'content update',
    };

    it('should change article', async () => {
      prismaMock.article.update.mockResolvedValue(mockArticle);

      await articleService.update(articleId, updateArticleDto);

      expect(prismaMock.article.update).toHaveBeenLastCalledWith({
        where: { id: articleId },
        data: {
          ...updateArticleDto,
          tags: {
            connectOrCreate: [],
          },
        },
        include: {
          tags: true,
        },
      });
    });

    it('should respond 404 if article not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('message', {
        code: PRISMA_ERROR_CODES.NOT_FOUND,
        clientVersion: '5.0.0',
      });

      prismaMock.article.update.mockRejectedValue(prismaError);

      await expect(
        articleService.update(articleId, updateArticleDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw any error', async () => {
      prismaMock.article.update.mockRejectedValue(new Error('error message'));

      await expect(
        articleService.update(articleId, updateArticleDto),
      ).rejects.toThrow('error message');
    });
  });

  describe('delete article', () => {
    const userId = 'userId';

    it('should delete article', async () => {
      prismaMock.article.delete.mockResolvedValue(mockArticle);
      prismaMock.article.findUnique.mockResolvedValue(mockArticle);

      await articleService.delete(articleId, userId, Role.admin);

      expect(prismaMock.article.delete).toHaveBeenLastCalledWith({
        where: { id: articleId },
        include: {
          tags: true,
        },
      });
    });

    it('should respond 404 if article not found', async () => {
      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(
        articleService.delete(articleId, userId, Role.viewer),
      ).rejects.toThrow(NotFoundException);
    });

    it('should respond 403 if user can not delete article', async () => {
      prismaMock.article.findUnique.mockResolvedValue(mockArticle);

      await expect(
        articleService.delete(articleId, userId, Role.editor),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
