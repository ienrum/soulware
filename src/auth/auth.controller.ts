import {
  Controller,
  Post,
  Body,
  Res,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignUpDto } from './dto/user-signup.dto';
import { UserSignInDto } from 'src/auth/dto/user-signin.dto';
import { Response } from 'express';
import { SetTokenCookieInterceptor } from 'src/auth/interceptors/setTokenCookie.interceptor';
import { CheckAuthorizedInterceptor } from 'src/auth/interceptors/checkAuthenticated.interceptor';
import { ClearJwtTokenInterceptor } from 'src/auth/interceptors/clearJwtToken.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() userSignUpDto: UserSignUpDto) {
    return this.authService.signUp(userSignUpDto);
  }

  @UseInterceptors(SetTokenCookieInterceptor)
  @Post('signin')
  async signIn(@Body() userSignInDto: UserSignInDto) {
    const token = await this.authService.signIn(userSignInDto);

    return { token, message: 'Sign in success' };
  }

  @UseInterceptors(ClearJwtTokenInterceptor)
  @Post('signout')
  signOut(e) {}

  @UseInterceptors(CheckAuthorizedInterceptor)
  @Get('me')
  me() {}
}
