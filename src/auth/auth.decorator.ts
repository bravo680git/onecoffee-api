import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './auth';

export const User = createParamDecorator(
  (key: keyof JwtPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return key ? user?.[key] : user;
  },
);
