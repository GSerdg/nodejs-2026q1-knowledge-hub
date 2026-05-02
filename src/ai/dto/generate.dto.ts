import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateDto {
  @ApiProperty({ example: 'prompt' })
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}
