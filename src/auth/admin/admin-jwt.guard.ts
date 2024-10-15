import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RedisService } from 'src/core/redis/redis.service';
import { getAdminTokenBlacklistKey } from '../auth.helper';

@Injectable()
export class AdminJwtAuth extends AuthGuard('jwt') {
  constructor(private readonly store: RedisService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const token = request.headers.authorization?.split(' ')?.[1] ?? '';

    const inBlackList = !!(await this.store.get(
      getAdminTokenBlacklistKey(token),
    ));

    if (inBlackList) {
      throw new UnauthorizedException();
    }
    return super.canActivate(context) as Promise<boolean>;
  }
}
