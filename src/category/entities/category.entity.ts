import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

export interface Category {
  id: string; // uuid v4
  name: string;
  description: string;
}

export class CategoryEntity implements Category {
  @ApiProperty({ example: randomUUID() })
  id!: string;

  @ApiProperty({ example: 'Name' })
  name!: string;

  @ApiProperty({ example: 'Description' })
  description!: string;
}
