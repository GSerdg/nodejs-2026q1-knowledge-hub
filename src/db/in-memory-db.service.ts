import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class InMemoryDbService {
  users: User[] = [];
  // articles: Article[] = [];
  // categories: any[] = [];
  // comments: any[] = [];
}
