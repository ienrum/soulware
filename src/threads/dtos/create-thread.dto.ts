import { MaxLength, MinLength } from 'class-validator';

export class CreateThreadDto {
  @MinLength(3, { message: 'Title is too short' })
  @MaxLength(20, { message: 'Title is too long' })
  title: string;

  @MinLength(10, { message: 'Content is too short' })
  @MaxLength(255, { message: 'Content is too long' })
  content: string;
}
