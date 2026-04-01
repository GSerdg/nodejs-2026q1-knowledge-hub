import { Injectable } from '@nestjs/common';
import { Article } from 'src/article/entities/article.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class InMemoryDbService {
  users: User[] = [];
  articles: Article[] = [];
  // categories: any[] = [];
  // comments: any[] = [];
}
