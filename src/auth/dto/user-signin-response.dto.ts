import { IsString } from 'class-validator';

export class SigninReponseDto {
  @IsString()
  accessToken: string;
  @IsString()
  refreshToken: string;
  @IsString()
  message: string;
}
