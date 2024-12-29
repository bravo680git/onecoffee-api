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
  USER_ROLE,
} from './auth.constant';
import { getOtpKey, getRefreshKey, getTokenBlacklistKey } from './auth.helper';

import {
  LoginGooglePayload,
  LoginPayload,
  OTPPayload,
  RefreshTokenPayload,
} from './dto/auth.input';
import { LoginResponse, OTPResponse } from './dto/auth.response';
import { Auth, google } from 'googleapis';

@Injectable()
export class AuthService {
  private ggClient: Auth.OAuth2Client;
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private store: RedisService,
    private mailService: MailService,
  ) {
    this.ggClient = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  }

  private async validateUserWithPassword(email: string, password: string) {
    try {
      const user = await this.userService.findOne(email);
      if (!user.password || !(await compare(password, user.password))) {
        throw new Error();
      }
      return { ...user, password: undefined };
    } catch {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_CREDENTIAL);
    }
  }

  async login(data: LoginPayload) {
    const user = await this.validateUserWithPassword(data.email, data.password);
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

  async loginGoogle(payload: LoginGooglePayload) {
    try {
      const info = await this.ggClient.getTokenInfo(payload.token);

      if (info.email !== payload.email) {
        throw new BadRequestException();
      }

      let user = await this.userService.findOneByEmail(payload.email);

      if (!user) {
        this.ggClient.setCredentials({ access_token: payload.token });
        const {
          data: { picture },
        } = await google
          .oauth2({ version: 'v2', auth: this.ggClient })
          .userinfo.get();

        user = await this.userService.create(
          {
            email: payload.email,
            avatar: picture,
          },
          USER_ROLE.USER,
        );
      }

      const tokens = this.generateTokens({
        sub: user.id,
        email: payload.email,
        role: USER_ROLE.USER,
      });
      return new LoginResponse({ ...tokens, user });
    } catch {
      throw new BadRequestException(ERROR_MESSAGE.LOGIN_GG_FAIL);
    }
  }
}
