import { Test, TestingModule } from '@nestjs/testing';
import { prismaMock, resetPrismaMock } from 'src/__tests__/prisma-mock';
import { PrismaService } from 'src/prisma/prisma.service';
import { vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Prisma, Role, User } from '@prisma/client';
import { PasswordService } from 'src/common/password.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { PRISMA_ERROR_CODES } from 'src/prisma/prisma-error-codes';

describe('UserService', () => {
  let userService: UserService;

  const hashedPassword = 'hashed_password';
  const userId = randomUUID();
  const mockUser: User = {
    id: userId,
    login: 'testLogin',
    password: hashedPassword,
    role: Role.editor,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const testId = 'testId';
  const select = {
    id: true,
    login: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    resetPrismaMock();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('find all users', () => {
    it('should return user without password', async () => {
      prismaMock.user.findMany.mockResolvedValue([mockUser, mockUser]);

      const result = await userService.findAll();

      expect(result).toBeInstanceOf(Array);
      expect(prismaMock.user.findMany).toHaveBeenLastCalledWith({ select });
    });
  });

  describe('find user by id', () => {
    it('should return array width users data (without password) width selection', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findById(userId);

      expect(typeof result.createdAt).toBe('number');
      expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
        where: { id: userId },
        select,
      });
    });

    it('should respond 404 if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(userService.findById(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(userService.findById(userId)).rejects.toThrow(
        `User with id ${userId} not found`,
      );
    });
  });

  describe('create user', () => {
    const createUserDto: CreateUserDto = {
      login: 'testLogin',
      password: 'password123',
      role: Role.viewer,
    };

    it('should create user, hashed password and return user data without password', async () => {
      vi.spyOn(PasswordService, 'hash').mockResolvedValue(hashedPassword);
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await userService.create(createUserDto);

      expect(PasswordService.hash).toHaveBeenLastCalledWith(
        createUserDto.password,
      );
      expect(prismaMock.user.create).toHaveBeenLastCalledWith({
        data: { ...createUserDto, password: hashedPassword },
        select,
      });
      expect(result.login).toBe(createUserDto.login);
    });

    it('should respond 409 if such login is exist', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (login)',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );

      prismaMock.user.create.mockRejectedValue(prismaError);

      await expect(userService.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(userService.create(createUserDto)).rejects.toThrow(
        `User with this login: ${createUserDto.login} already exists`,
      );
    });

    it('should throw any error', async () => {
      prismaMock.user.create.mockRejectedValue(new Error('error message'));

      await expect(userService.create(createUserDto)).rejects.toThrow(
        'error message',
      );
    });
  });

  describe('update user', () => {
    it('should change password, login and role, compare passwords and hash new password and return user data without password', async () => {
      vi.spyOn(PasswordService, 'compare').mockResolvedValue(true);
      vi.spyOn(PasswordService, 'hash').mockResolvedValue(hashedPassword);
      prismaMock.user.update.mockResolvedValue(mockUser);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const updateUserDto: UpdateUserDto = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
        login: 'newTestLogin',
        role: Role.viewer,
      };

      await userService.update(userId, updateUserDto, userId, Role.admin);

      expect(PasswordService.compare).toHaveBeenLastCalledWith(
        updateUserDto.oldPassword,
        mockUser.password,
      );
      expect(PasswordService.hash).toHaveBeenLastCalledWith(
        updateUserDto.newPassword,
      );
      expect(prismaMock.user.update).toHaveBeenLastCalledWith({
        where: { id: userId },
        data: {
          password: hashedPassword,
          login: updateUserDto.login,
          role: updateUserDto.role,
        },
        select,
      });
    });

    it('should respond 404 if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const updateUserDto: UpdateUserDto = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
        login: 'newTestLogin',
        role: Role.viewer,
      };

      await expect(
        userService.update(userId, updateUserDto, userId, Role.admin),
      ).rejects.toThrow(NotFoundException);
    });

    it('should respond 403 if user can not update users', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const updateUserDto: UpdateUserDto = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
        login: 'newTestLogin',
        role: Role.viewer,
      };

      await expect(
        userService.update(userId, updateUserDto, testId, Role.viewer),
      ).rejects.toThrow('You can not change any users');
      await expect(
        userService.update(userId, updateUserDto, userId, Role.viewer),
      ).rejects.toThrow('You can not change your own role');
    });

    it('should respond 403 if old password is wrong', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      vi.spyOn(PasswordService, 'compare').mockResolvedValue(false);

      const updateUserDto: UpdateUserDto = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      await expect(
        userService.update(userId, updateUserDto, testId, Role.admin),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        userService.update(userId, updateUserDto, testId, Role.admin),
      ).rejects.toThrow('Wrong password');
    });

    it('should respond 409 if such login is already in use', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (login)',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );

      prismaMock.user.update.mockRejectedValue(prismaError);

      await expect(
        userService.update(userId, { login: 'testLogin' }, testId, Role.admin),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw any error', async () => {
      prismaMock.user.update.mockRejectedValue(new Error('error message'));

      await expect(
        userService.update(userId, { login: 'testLogin' }, testId, Role.admin),
      ).rejects.toThrow('error message');
    });
  });

  describe('delete user', () => {
    it('should delete user', async () => {
      await userService.delete(mockUser.id, testId, Role.admin);

      expect(prismaMock.user.delete).toHaveBeenLastCalledWith({
        where: { id: mockUser.id },
        select,
      });
    });

    it('should respond 403 if user can not delete users', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        userService.delete(mockUser.id, testId, Role.viewer),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should respond 404 if user not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('message', {
        code: PRISMA_ERROR_CODES.NOT_FOUND,
        clientVersion: '5.0.0',
      });

      prismaMock.user.delete.mockRejectedValue(prismaError);

      await expect(
        userService.delete(mockUser.id, testId, Role.admin),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw any error', async () => {
      prismaMock.user.delete.mockRejectedValue(new Error('error message'));

      await expect(
        userService.delete(mockUser.id, testId, Role.admin),
      ).rejects.toThrow('error message');
    });
  });
});
