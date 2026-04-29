import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum SummaryLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  DETAILED = 'detailed',
}

export class SummarizeArticleDto {
  @ApiProperty({
    enum: SummaryLength,
    enumName: 'SummaryLength',
    example: SummaryLength.MEDIUM,
    required: false,
    default: SummaryLength.MEDIUM,
  })
  @IsOptional()
  @IsEnum(SummaryLength, {
    message: 'SummaryLength must be short, medium or detailed',
  })
  maxLength?: SummaryLength = SummaryLength.MEDIUM;
}
