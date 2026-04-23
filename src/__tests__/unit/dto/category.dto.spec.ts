import { validate } from 'class-validator';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';

describe('category dto', () => {
  describe('create', () => {
    it('should fail if required fields are missing', async () => {
      const dto = new CreateCategoryDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);

      const nodes = errors.map((e) => e.property);
      expect(nodes).toContain('name');
      expect(nodes).toContain('description');
    });

    it('should pass if all fields are valid', async () => {
      const dto = new CreateCategoryDto();
      dto.name = 'name';
      dto.description = 'description';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('update', () => {
    it('should fail if required fields are missing', async () => {
      const dto = new CreateCategoryDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);

      const nodes = errors.map((e) => e.property);
      expect(nodes).toContain('name');
      expect(nodes).toContain('description');
    });

    it('should pass if all fields are valid', async () => {
      const dto = new CreateCategoryDto();
      dto.name = 'name';
      dto.description = 'description';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});
