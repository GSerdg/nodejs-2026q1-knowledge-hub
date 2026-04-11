import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsArray,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { Status } from '@prisma/client';

export class UpdateArticleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ enum: Status })
  @IsEnum(Status, {
    message: 'Status must be draft, published or archived',
  })
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ example: randomUUID(), nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4')
  authorId?: string | null;

  @ApiPropertyOptional({ example: randomUUID(), nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4')
  categoryId?: string | null;

  @ApiPropertyOptional({ type: [String], example: ['tag1', 'tag2'] })
  @IsArray({ message: 'Tags must be an array' })
  @IsString({
    each: true,
    message: 'Each tag must be a string',
  })
  @IsOptional()
  tags?: string[];
}
