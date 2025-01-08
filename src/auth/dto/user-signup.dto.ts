import { MaxLength, MinLength } from 'class-validator';

export class UserSignUpDto {
  @MinLength(3, { message: 'Name is too short' })
  @MaxLength(20, { message: 'Name is too long' })
  name: string;

  @MinLength(8, { message: 'Password is too short' })
  @MaxLength(20, { message: 'Password is too long' })
  password: string;
}
