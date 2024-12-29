const OTP_KEY = 'login-otp';
const REFRESH_KEY = 'refresh-token';
const TOKEN_BLACKLIST_KEY = 'token-blacklist';

export const getOtpKey = (userId: number) => `${OTP_KEY}:${userId}`;

export const getRefreshKey = ({
  userId,
  getAll,
  token,
}: {
  userId: number;
  token?: string;
  getAll?: boolean;
}) => `${REFRESH_KEY}:${userId}:${getAll ? '*' : token}`;

export const getTokenBlacklistKey = (token: string) =>
  `${TOKEN_BLACKLIST_KEY}:${token}`;
