import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TranslateArticleDto {
  @ApiProperty({ example: 'russian' })
  @IsString()
  @IsNotEmpty()
  targetLanguage!: string;

  @ApiProperty({ example: 'english' })
  @IsString()
  @IsOptional()
  sourceLanguage?: string;
}
