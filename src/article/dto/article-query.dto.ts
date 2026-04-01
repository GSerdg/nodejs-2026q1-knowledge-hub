import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';

export class ArticleQueryDto {
  @IsOptional()
  @IsEnum(ArticleStatus, {
    message: 'Status must be draft, published or archived',
  })
  status?: ArticleStatus;

  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
