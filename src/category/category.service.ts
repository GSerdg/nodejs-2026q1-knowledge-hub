import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InMemoryDbService } from 'src/db/in-memory-db.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(private readonly db: InMemoryDbService) {}

  findAll() {
    return this.db.categories;
  }

  findById(id: string) {
    const category = this.db.categories.find((category) => category.id === id);

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  create(dto: CreateCategoryDto) {
    const id = randomUUID();

    const categoryData: Category = {
      id,
      ...dto,
    };

    this.db.categories.push(categoryData);

    return categoryData;
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const categoryIndex = this.db.categories.findIndex(
      (category) => category.id === id,
    );

    if (categoryIndex === -1) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    const category = this.db.categories[categoryIndex];

    this.db.categories[categoryIndex] = {
      ...category,
      ...updateCategoryDto,
    };

    return this.db.categories[categoryIndex];
  }

  delete(id: string) {
    const categoryIndex = this.db.categories.findIndex(
      (category) => category.id === id,
    );

    if (categoryIndex === -1) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    this.db.articles.forEach((article) => {
      if (article.categoryId === id) {
        article.categoryId = null;
      }
    });
    this.db.categories.splice(categoryIndex, 1);
  }
}
