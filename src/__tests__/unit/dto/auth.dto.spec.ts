import { validate } from 'class-validator';
import { SignupDto } from 'src/auth/dto/signup.dto';

describe('auth dto', () => {
  describe('signup', () => {
    it('should fail if required fields are missing', async () => {
      const dto = new SignupDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);

      const nodes = errors.map((e) => e.property);
      expect(nodes).toContain('login');
      expect(nodes).toContain('password');
    });

    it('should fail if password length error', async () => {
      const dto = new SignupDto();
      dto.login = 'login';
      dto.password = '123';

      const errors = await validate(dto);

      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('minLength');
    });

    it('should pass if all fields are valid', async () => {
      const dto = new SignupDto();
      dto.login = 'login';
      dto.password = '12345';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});
