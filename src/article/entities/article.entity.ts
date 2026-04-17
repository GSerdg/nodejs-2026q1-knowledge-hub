import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { randomUUID } from 'crypto';

export interface Article {
  id: string; // uuid v4
  title: string;
  content: string;
  status: Status;
  authorId: string | null; // refers to User
  categoryId: string | null; // refers to Category
  tags: string[]; // array of tag names
  createdAt: number; // timestamp of creation
  updatedAt: number; // timestamp of last update
}

export class ArticleEntity implements Article {
  @ApiProperty({ example: randomUUID() })
  id!: string;

  @ApiProperty({ example: 'Title' })
  title!: string;

  @ApiProperty({ example: 'Content' })
  content!: string;

  @ApiProperty({ enum: Status, default: Status.draft })
  status!: Status;

  @ApiProperty({ example: randomUUID(), nullable: true })
  authorId!: string | null;

  @ApiProperty({ example: randomUUID(), nullable: true })
  categoryId!: string | null;

  @ApiProperty({ example: ['tag1', 'tag2'], type: [String] })
  tags!: string[];

  @ApiProperty({ example: 1712045100000, description: 'Timestamp of creation' })
  createdAt!: number;

  @ApiProperty({
    example: 1712045100000,
    description: 'Timestamp of last update',
  })
  updatedAt!: number;
}
