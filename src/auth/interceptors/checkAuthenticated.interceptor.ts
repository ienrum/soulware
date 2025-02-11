import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map } from 'rxjs';
import { ACCESS_TOKEN_NAME } from 'src/common/constants';

@Injectable()
export class CheckAuthorizedInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extracFromCookie(request);

        return { isAuthorized: !!token, ...data };
      }),
    );
  }
  private extracFromCookie(request: any) {
    return request.cookies?.[ACCESS_TOKEN_NAME];
  }
}
