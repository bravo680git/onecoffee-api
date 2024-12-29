import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from 'src/core/redis/redis.service';
import { getTokenBlacklistKey } from './auth.helper';
import { AuthService } from './auth.service';
import { RequestWithUser } from './auth';
import { Reflector } from '@nestjs/core';
import { ROLE_METADATA_KEY, UserRole } from './auth.constant';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly store: RedisService,
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.headers.authorization?.split(' ')?.[1] ?? '';
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const jwtPayload = this.authService.verifyToken(token, 'access');
      request.user = {
        sub: jwtPayload.sub,
        email: jwtPayload.email,
        role: jwtPayload.role,
      };
    } catch {
      throw new UnauthorizedException();
    }

    const inBlackList = !!(await this.store.get(getTokenBlacklistKey(token)));

    if (inBlackList) {
      throw new UnauthorizedException();
    }

    const userRole = request.user.role;
    if (requiredRoles && (!userRole || requiredRoles.includes(userRole))) {
      throw new ForbiddenException();
    }

    return true;
  }
}
