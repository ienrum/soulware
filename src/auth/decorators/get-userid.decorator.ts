import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

const getPayload = (token: string) => {
  try {
    return jwt.verify(token, process.env.SECRET) as jwt.JwtPayload;
  } catch (e) {
    return null;
  }
};

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return getPayload(request.cookies.token).id;
  },
);
