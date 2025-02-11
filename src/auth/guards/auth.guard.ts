import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_NAME } from 'src/common/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: any): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extracFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Empty access token');
    }

    try {
      if (!process.env.SECRET) {
        throw new UnauthorizedException('Secret key not defined');
      }
      const payload = jwt.verify(token, process.env.SECRET);

      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }

    return true;
  }

  private extracFromCookie(request: any) {
    return request.cookies?.[ACCESS_TOKEN_NAME];
  }
}
