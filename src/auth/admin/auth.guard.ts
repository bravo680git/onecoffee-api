import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from 'src/core/redis/redis.service';
import { getAdminTokenBlacklistKey } from './auth.helper';
import { AuthService } from './auth.service';
import { RequestWithUser } from '../auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly store: RedisService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.headers.authorization?.split(' ')?.[1] ?? '';

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const jwtPayload = this.authService.verifyToken(token, 'access');
      request.user = { sub: jwtPayload.sub };
    } catch {
      throw new UnauthorizedException();
    }

    const inBlackList = !!(await this.store.get(
      getAdminTokenBlacklistKey(token),
    ));

    if (inBlackList) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
