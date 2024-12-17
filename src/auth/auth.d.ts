import { Request } from 'express';

export type JwtPayload = {
  email: string;
  sub: number;
};

type TokenType = 'access' | 'refresh';

type RequestWithUser = Request & {
  user?: Partial<JwtPayload>;
};
