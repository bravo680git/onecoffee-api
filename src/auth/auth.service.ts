import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { MailService } from 'src/core/mail/mail.service';
import { RedisService } from 'src/core/redis/redis.service';
import { UserService } from 'src/user/user.service';
import type { JwtPayload, TokenType } from './auth';
import {
  ACCESS_TOKEN_EXPIRED_IN,
  REFRESH_TOKEN_EXPIRED_IN,
  ERROR_MESSAGE,
  OTP_TTL,
} from './auth.constant';
import { getOtpKey, getRefreshKey, getTokenBlacklistKey } from './auth.helper';

import {
  LoginPayload,
  OTPPayload,
  RefreshTokenPayload,
} from './dto/auth.input';
import { LoginResponse, OTPResponse } from './dto/auth.response';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private store: RedisService,
    private mailService: MailService,
  ) {}

  private async validateUser(email: string, password: string) {
    try {
      const user = await this.userService.findOne(email);
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
      to: user.email,
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

  private generateTokens(jwtPayload: JwtPayload) {
    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRED_IN,
    });
    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRED_IN,
    });
    return { accessToken, refreshToken };
  }

  async verifyOTP(payload: OTPPayload) {
    try {
      const { password: _, ...user } = await this.userService.findOneById(
        payload.userId,
      );
      const otpKey = getOtpKey(user.id);
      const otp = await this.store.get<string>(otpKey);
      if (payload.otpCode !== otp) {
        throw new Error();
      }
      const { accessToken, refreshToken } = this.generateTokens({
        email: user.email,
        sub: user.id,
        role: user.role,
      });

      await this.store.set(
        getRefreshKey({
          userId: user.id,
          token: refreshToken,
        }),
        user.email,
        {
          ttl: REFRESH_TOKEN_EXPIRED_IN,
        },
      );

      return new LoginResponse({ accessToken, refreshToken, user });
    } catch {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_OTP);
    }
  }

  async refreshToken(payload: RefreshTokenPayload) {
    const jwtPayload = this.verifyToken(payload.refreshToken, 'refresh');
    const oldToken = getRefreshKey({
      userId: jwtPayload.sub,
      token: payload.refreshToken,
    });
    const isValid = !!(await this.store.get<string>(oldToken));
    if (!isValid) {
      throw new Error();
    }

    const { accessToken, refreshToken } = this.generateTokens({
      email: jwtPayload.email,
      sub: jwtPayload.sub,
      role: jwtPayload.role,
    });

    await Promise.allSettled([
      this.store.del(oldToken),
      this.store.set(
        getRefreshKey({ userId: jwtPayload.sub, token: refreshToken }),
        jwtPayload.email,
        {
          ttl: REFRESH_TOKEN_EXPIRED_IN,
        },
      ),
    ]);
    return new LoginResponse({ accessToken, refreshToken });
  }

  async logout(userId: number, token: string) {
    try {
      const jwtPayload = this.verifyToken(token, 'access');
      const exp = jwtPayload.exp - Math.floor(Date.now() / 1000);
      await Promise.allSettled([
        this.store.del(getRefreshKey({ userId, getAll: true })),
        this.store.set(getTokenBlacklistKey(token), userId, { ttl: exp }),
      ]);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  verifyToken(token: string, type: TokenType) {
    return this.jwtService.verify<JwtPayload & { exp: number }>(token, {
      secret:
        type === 'access'
          ? process.env.JWT_ADMIN_ACCESS_SECRET
          : process.env.JWT_ADMIN_REFRESH_SECRET,
    });
  }
}
