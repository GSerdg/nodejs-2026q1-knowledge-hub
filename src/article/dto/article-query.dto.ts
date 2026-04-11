import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { Status } from '@prisma/client';

export class ArticleQueryDto {
  @ApiPropertyOptional({
    enum: Status,
    default: Status.DRAFT,
    description: 'The status of the article',
  })
  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be draft, published or archived',
  })
  status?: Status;

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
