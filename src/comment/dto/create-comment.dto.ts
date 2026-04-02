import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { randomUUID } from 'node:crypto';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ example: randomUUID() })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  articleId!: string;

  @ApiPropertyOptional({ example: randomUUID(), nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4')
  authorId?: string | null;
}
