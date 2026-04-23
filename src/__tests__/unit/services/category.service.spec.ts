import { NotFoundException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { prismaMock, resetPrismaMock } from 'src/__tests__/prisma-mock';
import { CategoryService } from 'src/category/category.service';
import { PRISMA_ERROR_CODES } from 'src/prisma/prisma-error-codes';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CategoryService', () => {
  let categoryService: CategoryService;

  const categoryId = 'testId';
  const mockCategory = {
    id: categoryId,
    name: 'Tech',
    description: 'description',
  };

  const mockCategoryDto = {
    name: 'name',
    description: 'description',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    resetPrismaMock();
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  describe('find all', () => {
    it('should return all categories', async () => {
      prismaMock.category.findMany.mockResolvedValue([mockCategory]);

      const result = await categoryService.findAll();

      expect(result).toEqual([mockCategory]);
      expect(prismaMock.category.findMany).toHaveBeenCalled();
    });
  });

  describe('find by id', () => {
    it('should return a category if found', async () => {
      prismaMock.category.findUnique.mockResolvedValue(mockCategory);

      const result = await categoryService.findById('cat-123');

      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);

      await expect(categoryService.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return category', async () => {
      prismaMock.category.create.mockResolvedValue(mockCategory);

      const result = await categoryService.create(mockCategoryDto);

      expect(prismaMock.category.create).toHaveBeenCalled();
      expect(result.name).toBe('Tech');
    });
  });

  describe('update', () => {
    it('should update and return category', async () => {
      prismaMock.category.update.mockResolvedValue(mockCategory);

      const result = await categoryService.update(categoryId, mockCategoryDto);

      expect(result.name).toBe('Tech');
    });

    it('should throw NotFoundException on Prisma P2025 error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Not found',
        {
          code: PRISMA_ERROR_CODES.NOT_FOUND,
          clientVersion: '5.0.0',
        },
      );

      prismaMock.category.update.mockRejectedValue(prismaError);

      await expect(
        categoryService.update('invalid', mockCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw any error', async () => {
      prismaMock.category.update.mockRejectedValue(new Error('error message'));

      await expect(
        categoryService.update(categoryId, mockCategoryDto),
      ).rejects.toThrow('error message');
    });
  });

  describe('delete', () => {
    it('should delete and return category', async () => {
      prismaMock.category.delete.mockResolvedValue(mockCategory);

      const result = await categoryService.delete(categoryId);

      expect(result.id).toBe(categoryId);
    });

    it('should throw NotFoundException on delete if category does not exist', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Not found',
        {
          code: PRISMA_ERROR_CODES.NOT_FOUND,
          clientVersion: '5.0.0',
        },
      );
      prismaMock.category.delete.mockRejectedValue(prismaError);

      await expect(categoryService.delete('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw any error', async () => {
      prismaMock.category.delete.mockRejectedValue(new Error('error message'));

      await expect(categoryService.delete(categoryId)).rejects.toThrow(
        'error message',
      );
    });
  });
});
