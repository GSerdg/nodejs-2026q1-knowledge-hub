import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { IsNotEqualTo } from './decorators/is-not-equal-to.decorator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
  //   message:
  //     'Password must contain uppercase, lowercase, numbers and special characters',
  // })
  @IsNotEqualTo('oldPassword', {
    message: 'New password must be different from the old one',
  })
  newPassword!: string;
}
