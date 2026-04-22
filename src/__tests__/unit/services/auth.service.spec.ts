import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock, resetPrismaMock } from 'src/__tests__/prisma-mock';
import { PrismaService } from 'src/prisma/prisma.service';
import { vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Prisma, Role, User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/common/password.service';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshDto } from 'src/auth/dto/refresh.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  const hashedPassword = 'hashed_password';
  const mockUser: User = {
    id: randomUUID(),
    login: 'testLogin',
    password: hashedPassword,
    role: Role.viewer,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: JwtService,
          useValue: {
            signAsync: vi.fn(() => 'Bearer token'),
            verifyAsync: vi.fn(() => ({
              userId: 'userId',
              login: 'testLogin',
              role: Role.viewer,
            })),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    resetPrismaMock();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('signup', () => {
    const select = {
      id: true,
      login: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    };

    const signupDto = {
      login: 'testLogin',
      password: 'password123',
    };

    it('should create user, hashed password and return user data', async () => {
      vi.spyOn(PasswordService, 'hash').mockResolvedValue(hashedPassword);
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await authService.create(signupDto);

      expect(PasswordService.hash).toHaveBeenLastCalledWith(signupDto.password);
      expect(prismaMock.user.create).toHaveBeenLastCalledWith({
        data: { ...signupDto, password: hashedPassword, role: Role.viewer },
        select,
      });
      expect(result.login).toBe(signupDto.login);
    });

    it('should respond 400 if such login is already in use', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (login)',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );

      prismaMock.user.create.mockRejectedValue(prismaError);

      await expect(authService.create(signupDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      login: 'testLogin',
      password: 'password123',
    };

    const mockTokens = {
      accessToken: 'Bearer token',
      refreshToken: 'Bearer token',
    };

    it('should return tokens', async () => {
      vi.spyOn(PasswordService, 'compare').mockResolvedValue(true);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.login(loginDto);

      expect(result).toEqual(mockTokens);
    });

    it('should respond 400 if unknown login', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should respond 400 if unknown password compare error', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      vi.spyOn(PasswordService, 'compare').mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('refresh', () => {
    const refreshDto: RefreshDto = {
      refreshToken: 'refresh token',
    };

    const mockTokens = {
      accessToken: 'Bearer token',
      refreshToken: 'Bearer token',
    };

    it('should return tokens', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.refresh(refreshDto);

      expect(result).toEqual(mockTokens);
    });

    it('should respond 401 if refresh token is empty', async () => {
      await expect(authService.refresh({})).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should respond 400 if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.refresh(refreshDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
