import { Request } from 'express';
import { UserRole } from './auth.constant';

export type JwtPayload = {
  email: string;
  sub: number;
  role: UserRole;
};

type TokenType = 'access' | 'refresh';

type RequestWithUser = Request & {
  user?: Partial<JwtPayload>;
};
