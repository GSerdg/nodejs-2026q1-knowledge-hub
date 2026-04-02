import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { IsNotEqualTo } from './decorators/is-not-equal-to.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @IsNotEqualTo('oldPassword', {
    message: 'New password must be different from the old one',
  })
  newPassword!: string;
}
