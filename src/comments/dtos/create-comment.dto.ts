import { MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @MinLength(3, { message: 'Content is too short' })
  @MaxLength(255, { message: 'Content is too long' })
  content: string;
}
