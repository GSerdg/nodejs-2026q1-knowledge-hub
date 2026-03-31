import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { InMemoryDbService } from 'src/db/in-memory-db.service';

@Injectable()
export class UserService {
  constructor(private readonly db: InMemoryDbService) {}

  findAll() {
    return this.db.users.map(
      ({ password, ...userWithoutPassword }) => userWithoutPassword,
    );
  }
}
