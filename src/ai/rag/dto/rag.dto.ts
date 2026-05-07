import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Status } from '@prisma/client';

export class ReindexRequestDto {
  @IsOptional()
  @IsBoolean()
  onlyPublished?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  articleIds?: string[];
}

export class RagSearchRequestDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => Number(value))
  limit?: number = 5;

  @IsOptional()
  @IsEnum([Status])
  articleStatus?: Status;
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class RagChatRequestDto {
  @IsString()
  question!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
