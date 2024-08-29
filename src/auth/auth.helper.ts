const OTP_KEY = 'admin-login-otp';
export const getOtpKey = (userId: number) => `${OTP_KEY}:${userId}`;
