import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { map } from 'rxjs';
import {
  ThreadListResponseDto,
  ThreadResponseDto,
} from 'src/threads/dtos/thread.response.dto';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    let dto: any;

    if (request.method === 'GET' && request.params.id) {
      dto = ThreadResponseDto;
    } else if (request.method === 'GET') {
      dto = ThreadListResponseDto;
    }

    return next.handle().pipe(
      map((data) => {
        if (dto) {
          if (Array.isArray(data)) {
            return data.map((item) =>
              plainToInstance(dto, item, { excludeExtraneousValues: true }),
            );
          }
          return plainToInstance(dto, data, { excludeExtraneousValues: true });
        }

        return data;
      }),
    );
  }
}
