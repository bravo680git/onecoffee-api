import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { getAdminTokenBlacklistKey } from '../auth.helper';

@Injectable()
export class AdminJwtAuth extends AuthGuard('jwt') {
  constructor(@Inject(CACHE_MANAGER) private readonly store: Cache) {
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
