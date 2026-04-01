import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
  //   message:
  //     'Password must contain uppercase, lowercase, numbers and special characters',
  // })
  password!: string;

  @IsEnum(UserRole, { message: 'Role must be admin, editor or viewer' })
  @IsOptional()
  role?: UserRole;
}
