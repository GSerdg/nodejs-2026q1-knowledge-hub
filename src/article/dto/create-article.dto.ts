import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(ArticleStatus, {
    message: 'Status must be draft, published or archived',
  })
  status!: ArticleStatus;

  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  authorId!: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  categoryId!: string;

  @IsArray({ message: 'Tags must be an array' })
  @IsString({
    each: true,
    message: 'Each tag must be a string',
  })
  @IsNotEmpty()
  tags!: string[];
}
