import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from 'src/common/constants';

@Injectable()
export class ClearJwtTokenInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data) => {
        response.clearCookie(ACCESS_TOKEN_NAME);
        response.clearCookie(REFRESH_TOKEN_NAME);

        return data;
      }),
    );
  }
}
