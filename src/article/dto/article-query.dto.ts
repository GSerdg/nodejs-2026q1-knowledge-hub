import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

export class ArticleQueryDto {
  @ApiPropertyOptional({
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
    description: 'The status of the article',
  })
  @IsOptional()
  @IsEnum(ArticleStatus, {
    message: 'Status must be draft, published or archived',
  })
  status?: ArticleStatus;

  @ApiPropertyOptional({
    example: randomUUID(),
    description: 'UUID of the category, can be null or omitted',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string | null;

  @ApiPropertyOptional({
    description: 'Filter articles by tag name',
    example: 'tagName',
  })
  @IsOptional()
  @IsString()
  tag?: string;
}
