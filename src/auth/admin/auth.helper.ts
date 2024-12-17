const ADMIN_OTP_KEY = 'admin-login-otp';
const ADMIN_REFRESH_KEY = 'admin-refresh-token';
const ADMIN_TOKEN_BLACKLIST_KEY = 'admin-token-blacklist';

export const getAdminOtpKey = (userId: number) => `${ADMIN_OTP_KEY}:${userId}`;

export const getAdminRefreshKey = ({
  userId,
  getAll,
  token,
}: {
  userId: number;
  token?: string;
  getAll?: boolean;
}) => `${ADMIN_REFRESH_KEY}:${userId}:${getAll ? '*' : token}`;

export const getAdminTokenBlacklistKey = (token: string) =>
  `${ADMIN_TOKEN_BLACKLIST_KEY}:${token}`;
