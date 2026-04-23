import { PasswordService } from 'src/common/password.service';
import { vi } from 'vitest';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('PasswordService', () => {
  const password = 'plain_password';
  const hash = 'hashed_password';

  describe('hash', () => {
    it('should call bcrypt.hash with correct parameters', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue(hash as any);

      const result = await PasswordService.hash(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hash);
    });
  });

  describe('compare', () => {
    it('should return true if password matches', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

      const result = await PasswordService.compare(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    // it('should return false if password does not match', async () => {
    //   vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

    //   const result = await PasswordService.compare(password, 'wrong_hash');

    //   expect(result).toBe(false);
    // });
  });
});
