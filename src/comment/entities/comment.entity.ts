import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

export interface Comment {
  id: string; // uuid v4
  content: string;
  articleId: string; // refers to Article
  authorId: string | null; // refers to User
  createdAt: number; // timestamp of creation
}

export class CommentEntity implements Comment {
  @ApiProperty({ example: randomUUID() })
  id!: string;

  @ApiProperty({ example: 'Content' })
  content!: string;

  @ApiProperty({ example: randomUUID() })
  articleId!: string;

  @ApiProperty({ example: randomUUID(), nullable: true })
  authorId!: string | null;

  @ApiProperty({ example: 1712045100000, description: 'Timestamp of creation' })
  createdAt!: number;
}
