import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PRISMA_ERROR_CODES } from 'src/prisma/prisma-error-codes';

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
    return await this.prisma.user.findMany({ select });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return user;
  }

  async create(dto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      return await this.prisma.user.create({
        data: { ...dto, password: hashedPassword },
        select,
      });
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

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const { newPassword, oldPassword } = updatePasswordDto;

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new ForbiddenException(`Wrong password`);
    }

    return await this.prisma.user.update({
      where: { id },
      data: { password: await bcrypt.hash(newPassword, 10) },
      select,
    });
  }

  async delete(id: string) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
        select,
      });

      return deletedUser;
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
