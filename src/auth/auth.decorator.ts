import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload, RequestWithUser } from './auth';
import { ROLE_METADATA_KEY } from './auth.constant';
import { AuthGuard } from './auth.guard';

export const AuthUser = createParamDecorator(
  (key: keyof JwtPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return key ? user?.[key] : user;
  },
);

export const ForAuthRoles = (...roles: string[]) =>
  SetMetadata(ROLE_METADATA_KEY, roles);

export function Auth(...roles: string[]) {
  return applyDecorators(ForAuthRoles(...roles), UseGuards(AuthGuard));
}
