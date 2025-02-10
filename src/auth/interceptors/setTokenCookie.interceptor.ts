import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { SigninReponseDto } from 'src/auth/dto/user-signin-response.dto';
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from 'src/common/constants';

export const cookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
};

@Injectable()
export class SetTokenCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: SigninReponseDto) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();

        const { accessToken, refreshToken, message } = data;

        if (accessToken && refreshToken) {
          response.cookie(ACCESS_TOKEN_NAME, accessToken, cookieOptions);
          response.cookie(REFRESH_TOKEN_NAME, refreshToken, cookieOptions);
        }

        return message;
      }),
    );
  }
}
