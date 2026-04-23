import { Role } from '@prisma/client';
import { validate } from 'class-validator';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

describe('user dto', () => {
  describe('create', () => {
    it('should fail if required fields are missing', async () => {
      const dto = new CreateUserDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);

      const nodes = errors.map((e) => e.property);
      expect(nodes).toContain('login');
      expect(nodes).toContain('password');
    });

    it('should fail if role is an invalid enum value', async () => {
      const dto = new CreateUserDto();
      dto.login = 'login';
      dto.password = '123';
      (dto.role as any) = 'fail';

      const errors = await validate(dto);

      const roleError = errors.find((e) => e.property === 'role');
      expect(roleError).toBeDefined();
      expect(roleError?.constraints).toHaveProperty('isEnum');
    });

    it('should fail if password length error', async () => {
      const dto = new CreateUserDto();
      dto.login = 'login';
      dto.password = '123';

      const errors = await validate(dto);

      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('minLength');
    });

    it('should pass if all fields are valid', async () => {
      const dto = new CreateUserDto();
      dto.login = 'login';
      dto.password = '12345';
      dto.role = Role.admin;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('UpdateUserDto Validation', () => {
    it('should fail if the request body is empty (AtLeastOneProperty decorator)', async () => {
      const dto = new UpdateUserDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(JSON.stringify(errors)).toContain(
        'Update request body cannot be empty',
      );
    });

    it('should fail if newPassword is the same as oldPassword (IsNotEqualTo decorator)', async () => {
      const dto = new UpdateUserDto();
      dto.oldPassword = 'password123';
      dto.newPassword = 'password123';

      const errors = await validate(dto);

      const passwordError = errors.find((e) => e.property === 'newPassword');
      expect(passwordError?.constraints).toHaveProperty('isNotEqualTo');
      expect(passwordError?.constraints?.isNotEqualTo).toBe(
        'New password must be different from the old one',
      );
    });

    it('should fail if newPassword is too short', async () => {
      const dto = new UpdateUserDto();
      dto.newPassword = '123';

      const errors = await validate(dto);

      const passwordError = errors.find((e) => e.property === 'newPassword');
      expect(passwordError?.constraints).toHaveProperty('minLength');
    });

    it('should fail if role is an invalid enum value', async () => {
      const dto = new UpdateUserDto();
      (dto as any).role = 'SUPER_ADMIN';

      const errors = await validate(dto);

      const roleError = errors.find((e) => e.property === 'role');
      expect(roleError?.constraints).toHaveProperty('isEnum');
    });

    it('should pass if only one property is provided (e.g., login)', async () => {
      const dto = new UpdateUserDto();
      dto.login = 'new_login';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass if newPassword is different from oldPassword', async () => {
      const dto = new UpdateUserDto();
      dto.oldPassword = 'oldPassword123';
      dto.newPassword = 'newPassword123';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});
