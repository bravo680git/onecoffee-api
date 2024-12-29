import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { JwtPayload, RequestWithUser } from './auth';
import { ROLE_METADATA_KEY } from './auth.constant';

export const AuthUser = createParamDecorator(
  (key: keyof JwtPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return key ? user?.[key] : user;
  },
);

export const AuthRoles = (...roles: string[]) =>
  SetMetadata(ROLE_METADATA_KEY, roles);
