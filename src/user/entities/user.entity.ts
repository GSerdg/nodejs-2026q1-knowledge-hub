import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export interface User {
  id: string; // uuid v4
  login: string;
  password: string;
  role: Role;
  createdAt: number; // timestamp of creation
  updatedAt: number; // timestamp of last update
}

export class UserEntity implements User {
  @ApiProperty({ example: randomUUID() })
  id!: string;

  @ApiProperty({ example: 'login' })
  login!: string;

  @ApiProperty({ example: 'password' })
  password!: string;

  @ApiProperty({ enum: Role, default: Role.viewer })
  role!: Role;

  @ApiProperty({ example: 1712045100000, description: 'Timestamp of creation' })
  createdAt!: number;

  @ApiProperty({
    example: 1712045100000,
    description: 'Timestamp of last update',
  })
  updatedAt!: number;
}
