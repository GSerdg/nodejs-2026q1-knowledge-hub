import { validate } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';
import { GetCommentsQueryDto } from 'src/comment/dto/get-comments.dto';

describe('category dto', () => {
  describe('create', () => {
    it('should fail if required fields are missing', async () => {
      const dto = new CreateCommentDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);

      const nodes = errors.map((e) => e.property);
      expect(nodes).toContain('content');
      expect(nodes).toContain('articleId');
    });

    it('should fail if categoryId is not UUID value', async () => {
      const dto = new CreateCommentDto();
      dto.content = 'content';
      dto.articleId = 'fail uuid';
      dto.authorId = 'fail uuid';

      const errors = await validate(dto);

      const articleIdUuidError = errors.find((e) => e.property === 'articleId');
      const authorIdUuidError = errors.find((e) => e.property === 'authorId');

      expect(articleIdUuidError).toBeDefined();
      expect(articleIdUuidError?.constraints).toHaveProperty('isUuid');
      expect(authorIdUuidError).toBeDefined();
      expect(authorIdUuidError?.constraints).toHaveProperty('isUuid');
    });

    it('should pass if all fields are valid', async () => {
      const dto = new CreateCommentDto();
      dto.content = 'name';
      dto.articleId = randomUUID();
      dto.authorId = randomUUID();

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('get comments', () => {
    it('should fail if required fields are missing', async () => {
      const dto = new GetCommentsQueryDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);

      const nodes = errors.map((e) => e.property);
      expect(nodes).toContain('articleId');
    });

    it('should fail if categoryId is not UUID value', async () => {
      const dto = new GetCommentsQueryDto();
      dto.articleId = 'fail uuid';

      const errors = await validate(dto);

      const articleIdUuidError = errors.find((e) => e.property === 'articleId');

      expect(articleIdUuidError).toBeDefined();
      expect(articleIdUuidError?.constraints).toHaveProperty('isUuid');
    });

    it('should pass if all fields are valid', async () => {
      const dto = new GetCommentsQueryDto();
      dto.articleId = randomUUID();

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});
