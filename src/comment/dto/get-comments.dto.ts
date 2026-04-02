import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetCommentsQueryDto {
  @IsNotEmpty()
  @IsUUID('4')
  articleId!: string;
}
