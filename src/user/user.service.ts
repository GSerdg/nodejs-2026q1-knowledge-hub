import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from './entities/user.entity';
import { randomUUID } from 'node:crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
    return await this.prisma.user.create({ data: dto, select });
  }

  updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = this.db.users.find((user) => user.id === id);
    const { newPassword, oldPassword } = updatePasswordDto;

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (user.password !== oldPassword) {
      throw new ForbiddenException(`Wrong password`);
    }

    user.password = newPassword;
    user.updatedAt = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  delete(id: string) {
    const userIndex = this.db.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.db.comments = this.db.comments.filter(
      (comment) => comment.authorId !== id,
    );
    this.db.articles.forEach((article) => {
      if (article.authorId === id) {
        article.authorId = null;
      }
    });
    this.db.users.splice(userIndex, 1);
  }
}
