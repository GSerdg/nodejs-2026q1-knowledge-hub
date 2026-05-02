import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum AnalysisTask {
  REVIEW = 'review',
  BUGS = 'bugs',
  OPTIMIZE = 'optimize',
  EXPLAIN = 'explain',
}

export class AnalyzeArticleDto {
  @ApiProperty({
    enum: AnalysisTask,
    enumName: 'AnalysisTask',
    example: AnalysisTask.REVIEW,
    required: false,
    default: AnalysisTask.REVIEW,
  })
  @IsOptional()
  @IsEnum(AnalysisTask)
  task?: AnalysisTask = AnalysisTask.REVIEW;
}
