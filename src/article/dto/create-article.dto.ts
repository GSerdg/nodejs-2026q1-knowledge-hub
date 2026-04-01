import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
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
  @IsOptional()
  status?: ArticleStatus;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4')
  authorId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4')
  categoryId?: string | null;

  @IsArray({ message: 'Tags must be an array' })
  @IsString({
    each: true,
    message: 'Each tag must be a string',
  })
  @IsOptional()
  tags?: string[];
}
