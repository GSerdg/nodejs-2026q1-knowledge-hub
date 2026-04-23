import {
  UnprocessableEntityException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { Prisma, Role } from '@prisma/client';
import { prismaMock, resetPrismaMock } from 'src/__tests__/prisma-mock';
import { CommentService } from 'src/comment/comment.service';
import { PRISMA_ERROR_CODES } from 'src/prisma/prisma-error-codes';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CommentService', () => {
  let commentService: CommentService;

  const commentId = 'testId';
  const mockComment = {
    id: commentId,
    content: 'Nice article',
    authorId: 'user-1',
    articleId: 'art-1',
    createdAt: new Date(),
  };

  const mockCommentDto = {
    content: 'content',
    articleId: 'id',
    authorId: 'authorId',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    resetPrismaMock();
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
  });

  describe('find all', () => {
    it('should return all comments', async () => {
      prismaMock.comment.findMany.mockResolvedValue([mockComment, mockComment]);

      const result = await commentService.findAllByArticleId('id');

      expect(result).toBeInstanceOf(Array);
      expect(prismaMock.comment.findMany).toHaveBeenLastCalledWith({
        where: { articleId: 'id' },
      });
    });
  });

  describe('findById', () => {
    it('should return a comment and convert its timestamp', async () => {
      prismaMock.comment.findUnique.mockResolvedValue(mockComment);

      const result = await commentService.findById(commentId);

      expect(prismaMock.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
      });

      expect(typeof result.createdAt).toBe('number');
      expect(result.id).toBe(mockComment.id);
    });

    it('should throw NotFoundException if comment is not found', async () => {
      prismaMock.comment.findUnique.mockResolvedValue(null);

      await expect(commentService.findById('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should successfully create a comment', async () => {
      prismaMock.comment.create.mockResolvedValue(mockComment);

      await commentService.create(mockCommentDto);

      expect(prismaMock.comment.create).toHaveBeenCalledWith({
        data: mockCommentDto,
      });
    });

    it('should throw UnprocessableEntityException if author does not exist', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Foreign key fail',
        {
          code: PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT,
          clientVersion: '5.0.0',
          meta: { field_name: 'authorId_fkey' },
        },
      );

      prismaMock.comment.create.mockRejectedValue(error);

      await expect(commentService.create(mockCommentDto)).rejects.toThrow(
        new UnprocessableEntityException(
          `User with id ${mockCommentDto.authorId} does not exist`,
        ),
      );
    });

    it('should throw UnprocessableEntityException if article does not exist', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Foreign key fail',
        {
          code: PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT,
          clientVersion: '5.0.0',
          meta: { field_name: 'articleId_fkey' },
        },
      );

      prismaMock.comment.create.mockRejectedValue(error);

      await expect(commentService.create(mockCommentDto)).rejects.toThrow(
        new UnprocessableEntityException(
          `Article with id ${mockCommentDto.articleId} does not exist`,
        ),
      );
    });

    it('should throw UnprocessableEntityException if related record not found', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Foreign key fail',
        {
          code: PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT,
          clientVersion: '5.0.0',
          meta: { field_name: 'fkey' },
        },
      );

      prismaMock.comment.create.mockRejectedValue(error);

      await expect(commentService.create(mockCommentDto)).rejects.toThrow(
        new UnprocessableEntityException(`Related record not found`),
      );
    });

    it('should throw any error', async () => {
      prismaMock.comment.create.mockRejectedValue(new Error('error message'));

      await expect(commentService.create(mockCommentDto)).rejects.toThrow(
        'error message',
      );
    });
  });

  describe('delete', () => {
    it('should allow author to delete their own comment', async () => {
      prismaMock.comment.findUnique.mockResolvedValue(mockComment);
      prismaMock.comment.delete.mockResolvedValue(mockComment);

      await commentService.delete(commentId, 'user-1', Role.viewer);

      expect(prismaMock.comment.delete).toHaveBeenCalled();
    });

    it('should allow admin to delete any comment', async () => {
      prismaMock.comment.findUnique.mockResolvedValue(mockComment);
      prismaMock.comment.delete.mockResolvedValue(mockComment);

      await commentService.delete(commentId, 'admin-id', Role.admin);

      expect(prismaMock.comment.delete).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the author or admin', async () => {
      prismaMock.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        commentService.delete(commentId, 'other-user', Role.viewer),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      prismaMock.comment.findUnique.mockResolvedValue(null);

      await expect(
        commentService.delete('invalid', 'user-1', Role.admin),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
