import { User } from '@prisma/client';

export class LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: Omit<User, 'password'>;
  constructor(data: LoginResponse) {
    Object.assign(this, data);
  }
}

export class OTPResponse {
  constructor(private userId: number) {}
}
