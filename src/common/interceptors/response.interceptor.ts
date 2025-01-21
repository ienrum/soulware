import { Injectable, Logger } from '@nestjs/common';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { BaseResponseDto } from '../base-response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map((data: unknown) => this.handleResponse(context, data)));
  }

  handleResponse(context: ExecutionContext, data: unknown) {
    const response = context.switchToHttp().getResponse();
    const isStringData = typeof data === 'string';
    const responseMessage = isStringData ? data : 'Success';
    const responseData = isStringData ? null : data;

    return new BaseResponseDto(
      response.statusCode,
      responseMessage,
      responseData,
    );
  }
}
