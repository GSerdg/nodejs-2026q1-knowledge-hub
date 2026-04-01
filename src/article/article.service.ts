import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InMemoryDbService } from 'src/db/in-memory-db.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, ArticleStatus } from './entities/article.entity';
import { ArticleQueryDto } from './dto/article-query.dto';

@Injectable()
export class ArticleService {
  constructor(private readonly db: InMemoryDbService) {}

  findAll(query: ArticleQueryDto) {
    const { status, categoryId, tag } = query;
    let articles = [...this.db.articles];

    if (status) {
      articles = articles.filter((article) => article.status === status);
    }

    if (categoryId) {
      articles = articles.filter(
        (article) => article.categoryId === categoryId,
      );
    }

    if (tag) {
      articles = articles.filter((article) => article.tags.includes(tag));
    }

    return articles;
  }

  findById(id: string) {
    const article = this.db.articles.find((article) => article.id === id);

    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    return article;
  }

  create(dto: CreateArticleDto) {
    const id = randomUUID();
    const timestamp = Date.now();

    const articleData: Article = {
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: ArticleStatus.DRAFT,
      authorId: null,
      categoryId: null,
      tags: [],
      ...dto,
    };

    this.db.articles.push(articleData);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return articleData;
  }

  update(id: string, updatePasswordDto: UpdateArticleDto) {
    const articleIndex = this.db.articles.findIndex(
      (article) => article.id === id,
    );

    if (articleIndex === -1) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    const article = this.db.articles[articleIndex];

    this.db.articles[articleIndex] = {
      ...article,
      ...updatePasswordDto,
      updatedAt: Date.now(),
    };

    return this.db.articles[articleIndex];
  }

  delete(id: string) {
    const articleIndex = this.db.articles.findIndex(
      (article) => article.id === id,
    );

    if (articleIndex === -1) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    this.db.articles.splice(articleIndex, 1);
  }
}
