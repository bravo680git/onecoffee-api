import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginPayload {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class OTPPayload {
  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class RefreshTokenPayload {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LoginGooglePayload {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
