import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class SetTokenCookieInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SetTokenCookieInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();

        const { token, ...restData } = data;

        if (token) {
          response.cookie('token', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });
        }

        this.logger.log('restData: ' + JSON.stringify(restData));

        return restData;
      }),
    );
  }
}
