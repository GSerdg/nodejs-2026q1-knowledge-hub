import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PRISMA_ERROR_CODES } from 'src/prisma/prisma-error-codes';
import { convertTimestamp } from 'src/utils/convertTimestamp';
import { PasswordService } from 'src/common/password.service';

const select = {
  id: true,
  login: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({ select });

    return convertTimestamp(users);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return convertTimestamp(user);
  }

  async create(dto: CreateUserDto) {
    try {
      const hashedPassword = await PasswordService.hash(dto.password);

      const user = await this.prisma.user.create({
        data: { ...dto, password: hashedPassword },
        select,
      });

      return convertTimestamp(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `User with this login: ${dto.login} already exists`,
          );
        }
      }

      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { newPassword, oldPassword, login, role } = updateUserDto;

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (oldPassword && newPassword) {
      const isMatch = await PasswordService.compare(oldPassword, user.password);

      if (!isMatch) {
        throw new ForbiddenException(`Wrong password`);
      }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          password: newPassword
            ? await PasswordService.hash(newPassword)
            : undefined,
          login,
          role,
        },
        select,
      });

      return convertTimestamp(updatedUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Login is already taken');
        }
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
        select,
      });

      return convertTimestamp(deletedUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.NOT_FOUND) {
          throw new NotFoundException(`User with id ${id} not found`);
        }
      }

      throw error;
    }
  }
}
