import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { USER_ROLE } from './auth.constant';
import { AuthRoles, AuthUser } from './auth.decorator';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import {
  LoginPayload,
  OTPPayload,
  RefreshTokenPayload,
} from './dto/auth.input';

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  adminLogin(@Body() data: LoginPayload) {
    return this.authService.login(data);
  }

  @Post('/verify-otp')
  @HttpCode(200)
  verifyOTP(@Body() data: OTPPayload) {
    return this.authService.verifyOTP(data);
  }

  @Post('/refresh')
  @HttpCode(200)
  refreshToken(@Body() payload: RefreshTokenPayload) {
    return this.authService.refreshToken(payload);
  }

  @Post('/logout')
  @AuthRoles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard)
  @HttpCode(200)
  logout(@AuthUser('sub') userId: number, @Req() req: Request) {
    const token = req.headers.authorization!.split(' ')[1];

    return this.authService.logout(userId, token);
  }
}
