import { IsString } from 'class-validator';

export class UserSignInDto {
  @IsString()
  name: string;

  @IsString()
  password: string;
}
