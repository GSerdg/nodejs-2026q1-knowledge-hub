import { Role, Status } from '@prisma/client';
import { validate } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { ArticleQueryDto } from 'src/article/dto/article-query.dto';
import { CreateArticleDto } from 'src/article/dto/create-article.dto';
import { UpdateArticleDto } from 'src/article/dto/update-article.dto';

describe('article dto', () => {
  describe('create article dto validation', () => {
    it('should fail if required fields are missing', async () => {
      const dto = new CreateArticleDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);

      const nodes = errors.map((e) => e.property);
      expect(nodes).toContain('title');
      expect(nodes).toContain('content');
    });

    it('should fail if status is an invalid enum value', async () => {
      const dto = new CreateArticleDto();
      dto.title = 'Valid Title';
      dto.content = 'Valid Content';
      (dto as any).status = 'INVALID_STATUS';

      const errors = await validate(dto);

      const statusError = errors.find((e) => e.property === 'status');
      expect(statusError).toBeDefined();
      expect(statusError?.constraints).toHaveProperty('isEnum');
    });

    it('should fail if categoryId or authorId is not UUID value', async () => {
      const dto = new CreateArticleDto();
      dto.title = 'Valid Title';
      dto.content = 'Valid Content';
      (dto as any).status = Role.editor;
      dto.authorId = 'invalid uuid';
      dto.categoryId = 'invalid uuid';

      const errors = await validate(dto);

      const authorUuidError = errors.find((e) => e.property === 'authorId');
      const categoryUuidError = errors.find((e) => e.property === 'categoryId');

      expect(authorUuidError).toBeDefined();
      expect(authorUuidError?.constraints).toHaveProperty('isUuid');
      expect(categoryUuidError).toBeDefined();
      expect(categoryUuidError?.constraints).toHaveProperty('isUuid');
    });

    it('should pass if all fields are valid', async () => {
      const dto = new CreateArticleDto();
      dto.title = 'Clean Code';
      dto.content = 'Great book content';
      dto.status = Status.draft;
      dto.categoryId = randomUUID();

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('update article dto validation', () => {
    it('should fail if required fields are missing', async () => {
      const dto = new UpdateArticleDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);

      const nodes = errors.map((e) => e.property);
      expect(nodes).toContain('title');
      expect(nodes).toContain('content');
    });

    it('should fail if status is an invalid enum value', async () => {
      const dto = new UpdateArticleDto();
      dto.title = 'Valid Title';
      dto.content = 'Valid Content';
      (dto as any).status = 'INVALID_STATUS';

      const errors = await validate(dto);

      const statusError = errors.find((e) => e.property === 'status');
      expect(statusError).toBeDefined();
      expect(statusError?.constraints).toHaveProperty('isEnum');
    });

    it('should fail if categoryId or authorId is not UUID value', async () => {
      const dto = new UpdateArticleDto();
      dto.title = 'Valid Title';
      dto.content = 'Valid Content';
      (dto as any).status = Role.editor;
      dto.authorId = 'invalid uuid';
      dto.categoryId = 'invalid uuid';

      const errors = await validate(dto);

      const authorUuidError = errors.find((e) => e.property === 'authorId');
      const categoryUuidError = errors.find((e) => e.property === 'categoryId');

      expect(authorUuidError).toBeDefined();
      expect(authorUuidError?.constraints).toHaveProperty('isUuid');
      expect(categoryUuidError).toBeDefined();
      expect(categoryUuidError?.constraints).toHaveProperty('isUuid');
    });

    it('should pass if all fields are valid', async () => {
      const dto = new UpdateArticleDto();
      dto.title = 'Clean Code';
      dto.content = 'Great book content';
      dto.status = Status.draft;
      dto.categoryId = randomUUID();
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('update article dto validation', () => {
    it('should fail if status is an invalid enum value', async () => {
      const dto = new ArticleQueryDto();
      (dto as any).status = 'INVALID_STATUS';

      const errors = await validate(dto);

      const statusError = errors.find((e) => e.property === 'status');
      expect(statusError).toBeDefined();
      expect(statusError?.constraints).toHaveProperty('isEnum');
    });

    it('should fail if categoryId is not UUID value', async () => {
      const dto = new ArticleQueryDto();
      dto.categoryId = 'invalid uuid';

      const errors = await validate(dto);

      const categoryUuidError = errors.find((e) => e.property === 'categoryId');

      expect(categoryUuidError).toBeDefined();
      expect(categoryUuidError?.constraints).toHaveProperty('isUuid');
    });

    it('should pass if all fields are valid', async () => {
      const dto = new ArticleQueryDto();
      dto.status = Status.draft;
      dto.categoryId = randomUUID();
      dto.tag = 'tag';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});
