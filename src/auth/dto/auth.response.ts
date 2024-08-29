import { User } from '@prisma/client';

export class LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: Omit<User, 'password'>;

  constructor(
    accessToken: string,
    refreshToken: string,
    user?: Omit<User, 'password'>,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}

export class OTPResponse {
  userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }
}
