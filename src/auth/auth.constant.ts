import { $Enums } from '@prisma/client';

export const OTP_TTL = 60 * 3;
export const ACCESS_TOKEN_EXPIRED_IN = 1 * 60 * 60;
export const REFRESH_TOKEN_EXPIRED_IN = 3 * 24 * 60 * 60;

export const ERROR_MESSAGE = {
  INVALID_CREDENTIAL: 'USERNAME_OR_PASSWORD_INCORRECT',
  INVALID_OTP: 'TOKEN_INCORRECT',
  LOGIN_GG_FAIL: 'LOGIN_GG_FAIL',
};

export const ROLE_METADATA_KEY = 'roles';

export const USER_ROLE = $Enums.UserRole;

export type UserRole = keyof typeof USER_ROLE;
