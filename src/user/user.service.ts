import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryDbService } from 'src/db/in-memory-db.service';
import { User, UserRole } from './entities/user.entity';
import { randomUUID } from 'node:crypto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly db: InMemoryDbService) {}

  findAll() {
    return this.db.users.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ password, ...userWithoutPassword }) => userWithoutPassword,
    );
  }

  findById(id: string) {
    const user = this.db.users.find((user) => user.id === id);

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  create(dto: CreateUserDto) {
    const id = randomUUID();
    const timestamp = Date.now();

    const userData: User = {
      id,
      role: UserRole.VIEWER,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...dto,
    };

    this.db.users.push(userData);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = userData;
    return userWithoutPassword;
  }
}
