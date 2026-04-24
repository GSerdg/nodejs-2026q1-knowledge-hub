import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../../../auth/guards/roles.guard'; // проверь путь
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { ForbiddenError } from 'src/common/errors/custom-error';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: vi.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (
    user: any,
    method = 'GET',
    url = '/articles',
  ): Partial<ExecutionContext> =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user, method, url }),
      }),
      getHandler: vi.fn(),
      getClass: vi.fn(),
    }) as any;

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(reflector).toBeDefined();
  });

  describe('can activate logic', () => {
    it('should return true if the route is public', () => {
      const context = createMockContext(null) as ExecutionContext;
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false if no user is present in the request', () => {
      const context = createMockContext(null) as ExecutionContext;
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should allow Admin to access anything', () => {
      const context = createMockContext(
        { role: Role.admin },
        'DELETE',
        '/category/1',
      ) as ExecutionContext;
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      expect(guard.canActivate(context)).toBe(true);
    });

    describe('Viewer role restrictions', () => {
      it('should allow Viewer to perform GET requests', () => {
        const context = createMockContext(
          { role: Role.viewer },
          'GET',
        ) as ExecutionContext;
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should throw ForbiddenError if Viewer tries to perform non-GET requests', () => {
        const context = createMockContext(
          { role: Role.viewer },
          'POST',
        ) as ExecutionContext;
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenError);
        expect(() => guard.canActivate(context)).toThrow(
          'Viewer role has read-only access',
        );
      });
    });

    describe('Editor role restrictions', () => {
      it('should throw ForbiddenError if Editor tries to manage categories', () => {
        const context = createMockContext(
          { role: Role.editor },
          'POST',
          '/category',
        ) as ExecutionContext;
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        expect(() => guard.canActivate(context)).toThrow(
          'Editors cannot manage categories',
        );
      });

      it('should throw ForbiddenError if Editor tries to create a user', () => {
        const context = createMockContext(
          { role: Role.editor },
          'POST',
          '/user',
        ) as ExecutionContext;
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        expect(() => guard.canActivate(context)).toThrow(
          'Editors cannot create new user',
        );
      });

      it('should allow Editor to perform other actions (e.g., manage articles)', () => {
        const context = createMockContext(
          { role: Role.editor },
          'POST',
          '/articles',
        ) as ExecutionContext;
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        expect(guard.canActivate(context)).toBe(true);
      });
    });

    describe('RBAC decorator logic', () => {
      it('should throw ForbiddenError if user role is not in the required roles list', () => {
        const context = createMockContext({
          role: 'SOME_OTHER_ROLE' as any,
        }) as ExecutionContext;

        vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
          if (key === IS_PUBLIC_KEY) return false;
          if (key === ROLES_KEY) return [Role.admin];
          return null;
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenError);
      });

      it('should return true if no required roles metadata is present', () => {
        const context = createMockContext({
          role: Role.editor,
        }) as ExecutionContext;
        vi.spyOn(reflector, 'getAllAndOverride')
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(null);

        expect(guard.canActivate(context)).toBe(true);
      });
    });
  });
});
