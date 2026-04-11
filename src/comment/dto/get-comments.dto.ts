import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class GetCommentsQueryDto {
  @ApiProperty({ example: randomUUID() })
  @IsNotEmpty()
  @IsUUID('4')
  articleId!: string;
}
