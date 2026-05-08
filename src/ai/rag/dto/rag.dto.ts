import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Status } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

export class ReindexRequestDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  onlyPublished?: boolean = true;

  @ApiPropertyOptional({ example: [randomUUID()] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  articleIds?: string[];
}

export class RagSearchRequestDto {
  @ApiProperty({ example: 'query' })
  @IsString()
  @IsNotEmpty()
  query!: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => Number(value))
  limit?: number = 5;

  @ApiPropertyOptional({
    enum: Status,
    enumName: 'Status',
    example: Status.published,
    required: false,
    default: Status.published,
  })
  @IsOptional()
  @IsEnum(Status)
  articleStatus?: Status;

  @ApiPropertyOptional({ example: randomUUID() })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String], example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class RagChatRequestDto {
  @ApiProperty({ example: 'question' })
  @IsString()
  question!: string;

  @ApiPropertyOptional({ example: randomUUID() })
  @IsOptional()
  @IsString()
  conversationId?: string;
}
