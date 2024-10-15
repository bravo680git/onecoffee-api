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
import type { JwtPayload } from '../auth';
import {
  ADMIN_ACCESS_TOKEN_EXPIRED_IN,
  ADMIN_REFRESH_TOKEN_EXPIRED_IN,
  ERROR_MESSAGE,
  OTP_TTL,
} from '../auth.constant';
import {
  getAdminOtpKey,
  getAdminRefreshKey,
  getAdminTokenBlacklistKey,
} from '../auth.helper';
import {
  LoginPayload,
  OTPPayload,
  RefreshTokenPayload,
} from '../dto/auth.input';
import { LoginResponse, OTPResponse } from '../dto/auth.response';

@Injectable()
export class AdminAuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private store: RedisService,
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
      to: user.email,
      data: { name: 'Admin', otp, expirationTime: OTP_TTL / 60 },
    });

    return new OTPResponse(user.id);
  }

  private async generateOTP(userId: number) {
    const key = getAdminOtpKey(userId);
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
      secret: process.env.JWT_ADMIN_ACCESS_SECRET,
      expiresIn: ADMIN_ACCESS_TOKEN_EXPIRED_IN,
    });
    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: process.env.JWT_ADMIN_REFRESH_SECRET,
      expiresIn: ADMIN_REFRESH_TOKEN_EXPIRED_IN,
    });
    return { accessToken, refreshToken };
  }

  async verifyOTP(payload: OTPPayload) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = await this.usersService.findOneById(
        payload.userId,
      );
      const otpKey = getAdminOtpKey(user.id);
      const otp = await this.store.get<string>(otpKey);
      if (payload.otpCode !== otp) {
        throw new Error();
      }

      const { accessToken, refreshToken } = this.generateTokens({
        email: user.email,
        sub: user.id,
      });

      await this.store.set(
        getAdminRefreshKey({
          userId: user.id,
          token: refreshToken,
        }),
        user.email,
        {
          ttl: ADMIN_REFRESH_TOKEN_EXPIRED_IN,
        },
      );

      return new LoginResponse(accessToken, refreshToken, user);
    } catch (err) {
      console.log(err);

      throw new BadRequestException(ERROR_MESSAGE.INVALID_OTP);
    }
  }

  async refreshToken(payload: RefreshTokenPayload) {
    try {
      const jwtPayload = this.jwtService.verify<JwtPayload>(
        payload.refreshToken,
        {
          secret: process.env.JWT_ADMIN_REFRESH_SECRET,
        },
      );
      const oldToken = getAdminRefreshKey({
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
      });

      await Promise.allSettled([
        this.store.del(oldToken),
        this.store.set(
          getAdminRefreshKey({ userId: jwtPayload.sub, token: refreshToken }),
          jwtPayload.email,
          {
            ttl: ADMIN_REFRESH_TOKEN_EXPIRED_IN,
          },
        ),
      ]);
      return new LoginResponse(accessToken, refreshToken);
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }
  }

  async logout(userId: number, token: string) {
    try {
      const jwtPayload = this.jwtService.verify<{ exp: number }>(token, {
        secret: process.env.JWT_ADMIN_ACCESS_SECRET,
      });
      const exp = jwtPayload.exp - Math.floor(Date.now() / 1000);
      await Promise.allSettled([
        this.store.del(getAdminRefreshKey({ userId, getAll: true })),
        this.store.set(getAdminTokenBlacklistKey(token), userId, { ttl: exp }),
      ]);
      return true;
    } catch (err) {
      console.log(err);

      throw new UnauthorizedException();
    }
  }
}
