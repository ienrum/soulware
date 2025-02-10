import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignUpDto } from './dto/user-signup.dto';
import { UserSignInDto } from 'src/auth/dto/user-signin.dto';
import {
  cookieOptions,
  SetTokenCookieInterceptor,
} from 'src/auth/interceptors/setTokenCookie.interceptor';
import { CheckAuthorizedInterceptor } from 'src/auth/interceptors/checkAuthenticated.interceptor';
import { ClearJwtTokenInterceptor } from 'src/auth/interceptors/clearJwtToken.interceptor';
import { Request, Response } from 'express';
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from './../common/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() userSignUpDto: UserSignUpDto) {
    await this.authService.signUp(userSignUpDto);

    return 'User created successfully';
  }

  @UseInterceptors(SetTokenCookieInterceptor)
  @Post('signin')
  async signIn(@Body() userSignInDto: UserSignInDto) {
    const token = await this.authService.signIn(userSignInDto);

    return { ...token, message: 'Sign in success' };
  }

  @UseInterceptors(ClearJwtTokenInterceptor)
  @Post('signout')
  signOut() {}

  @UseInterceptors(CheckAuthorizedInterceptor)
  @Get('me')
  me() {}

  @Post('refresh')
  async refresh(@Req() request: Request, @Res() response: Response) {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_NAME];

    const newAccessToken =
      await this.authService.refreshAccessToken(refreshToken);

    response.clearCookie(ACCESS_TOKEN_NAME, cookieOptions);
    response.cookie(ACCESS_TOKEN_NAME, newAccessToken, cookieOptions);

    response.send('Access token refreshed');
  }
}
