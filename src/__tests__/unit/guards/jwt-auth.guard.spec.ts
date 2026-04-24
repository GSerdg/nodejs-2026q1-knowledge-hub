import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard'; // Проверь путь
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UnauthorizedError } from 'src/common/errors/custom-error';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: vi.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (url: string): Partial<ExecutionContext> =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ url }),
      }),
      getHandler: vi.fn(),
      getClass: vi.fn(),
    }) as any;

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(reflector).toBeDefined();
  });

  describe('can activate', () => {
    it('should return true for public paths', () => {
      const context = createMockContext('/auth/login') as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true, if use @Public() decorator', () => {
      const context = createMockContext('/protected-path') as ExecutionContext;
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should call super.canActivate for protected paths', () => {
      const context = createMockContext('/articles') as ExecutionContext;
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const superCanActivateSpy = vi
        .spyOn(JwtAuthGuard.prototype, 'canActivate')
        .mockImplementation(() => true);

      expect(guard.canActivate(context)).toBe(true);
      superCanActivateSpy.mockRestore();
    });
  });

  describe('handle request', () => {
    it('should return user if no errors and user exist', () => {
      const user = { id: '1', login: 'test' };
      expect(guard.handleRequest(null, user)).toBe(user);
    });

    it('should throw UnauthorizedError if user not found', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedError);
      expect(() => guard.handleRequest(null, null)).toThrow(
        'Invalid token or absent',
      );
    });

    it('should throw custom error', () => {
      const error = new Error('Custom error');
      expect(() => guard.handleRequest(error, null)).toThrow(error);
    });
  });
});
