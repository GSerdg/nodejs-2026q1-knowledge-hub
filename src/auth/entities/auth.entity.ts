import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';

export interface MyJwtPayload extends JwtPayload {
  userId: string;
  login: string;
  role: string;
}

export interface AuthenticatedUser {
  userId: string;
  login: string;
  role: Role;
}

export type RequestWithUser = Request & { user: AuthenticatedUser };

export class TokensResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken!: string;
}
