const OTP_KEY = 'otp';
export const getOtpKey = (userId: number) => `${OTP_KEY}:${userId}`;
