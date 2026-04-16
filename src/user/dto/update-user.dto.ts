import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { IsNotEqualTo } from './decorators/is-not-equal-to.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  oldPassword?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @IsNotEqualTo('oldPassword', {
    message: 'New password must be different from the old one',
  })
  newPassword?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  login?: string;

  @ApiProperty()
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
