import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/decorators/Roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const { roles: userRoles } = user.roles;
    if (this.matchRoles(roles, userRoles)) {
      return true;
    }

    throw new UnauthorizedException('You do not have permission');
  }

  private matchRoles(roles: string[], userRoles: string[]) {
    return roles.some((role) => userRoles?.includes(role));
  }
}
