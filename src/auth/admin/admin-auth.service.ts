import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { Cache } from 'cache-manager';
import { ERROR_MESSAGE } from 'src/lib/utils/constant';
import { UserService } from 'src/user/user.service';
import type { JwtPayload } from '../auth';
import {
  ADMIN_ACCESS_TOKEN_EXPIRED_IN,
  ADMIN_REFRESH_TOKEN_EXPIRED_IN,
  OTP_TTL,
} from '../auth.constant';
import { getOtpKey } from '../auth.helper';
import { LoginPayload, OTPPayload } from '../dto/auth.input';
import { LoginResponse, OTPResponse } from '../dto/auth.response';
import { MailService } from 'src/core/mail/mail.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private store: Cache,
    private mailService: MailService,
  ) {}

  private async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findOne(email);
      if (!(await compare(password, user.password))) {
        throw new Error();
      }
      return { ...user, password: undefined };
    } catch {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_CREDENTIAL);
    }
  }

  async login(data: LoginPayload) {
    const user = await this.validateUser(data.email, data.password);
    const otp = await this.generateOTP(user.id);

    await this.mailService.sendMail('admin-otp', {
      email: user.email,
      data: { name: 'Admin', otp, expirationTime: OTP_TTL / 60 },
    });

    return new OTPResponse(user.id);
  }

  private async generateOTP(userId: number) {
    const key = getOtpKey(userId);
    const existedOtp = await this.store.get<string>(key);
    if (existedOtp) {
      return existedOtp;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.store.set(key, otp, { ttl: OTP_TTL });
    return otp;
  }

  async verifyOTP(payload: OTPPayload) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = await this.usersService.findOneById(
        payload.userId,
      );
      const otpKey = getOtpKey(user.id);
      const otp = await this.store.get<string>(otpKey);
      if (payload.otpCode !== otp) {
        throw new Error();
      }

      const jwtPayload: JwtPayload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(jwtPayload, {
        secret: process.env.JWT_ADMIN_ACCESS_SECRET,
        expiresIn: ADMIN_ACCESS_TOKEN_EXPIRED_IN,
      });
      const refreshToken = this.jwtService.sign(jwtPayload, {
        secret: process.env.JWT_ADMIN_REFRESH_SECRET,
        expiresIn: ADMIN_REFRESH_TOKEN_EXPIRED_IN,
      });
      return new LoginResponse(accessToken, refreshToken, user);
    } catch {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_OTP);
    }
  }
}
