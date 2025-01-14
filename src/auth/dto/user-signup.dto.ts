import { Matches, MaxLength, MinLength } from 'class-validator';

export class UserSignUpDto {
  @MinLength(3, { message: 'Name is too short' })
  @MaxLength(20, { message: 'Name is too long' })
  name: string;

  @MinLength(8, { message: 'Password is too short' })
  @MaxLength(20, { message: 'Password is too long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number or special character',
    },
  )
  password: string;
}
