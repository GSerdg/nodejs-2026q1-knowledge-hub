import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock, resetPrismaMock } from 'src/__tests__/prisma-mock';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Role, User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/common/password.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: JwtService,
          useValue: {
            signAsync: vi.fn(),
            verifyAsync: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    resetPrismaMock();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const hashedPassword = 'hashed_password';

    const signupDto = {
      login: 'testLogin',
      password: 'password123',
    };

    const mockUser: User = {
      id: randomUUID(),
      login: 'testLogin',
      // password: hashedPassword,
      role: 'viewer',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create user, hashed password and return user data', async () => {
      vi.spyOn(PasswordService, 'hash').mockResolvedValue(hashedPassword);
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await service.create(signupDto);

      expect(PasswordService.hash).toHaveBeenLastCalledWith(signupDto.password);
      expect(prismaMock.user.create).toHaveBeenLastCalledWith({
        data: { ...signupDto, password: hashedPassword, role: Role.viewer },
        select: expect.any(Object),
      });
      expect(result.login).toBe(signupDto.login);
    });
  });
});
