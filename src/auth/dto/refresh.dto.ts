import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ required: true })
  @IsOptional()
  refreshToken?: string;
}
