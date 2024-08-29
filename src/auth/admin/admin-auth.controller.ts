import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '../auth.decorator';
import {
  LoginPayload,
  OTPPayload,
  RefreshTokenPayload,
} from '../dto/auth.input';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtAuth } from './admin-jwt.guard';
import { Request } from 'express';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(200)
  adminLogin(@Body() data: LoginPayload) {
    return this.adminAuthService.login(data);
  }

  @Post('/verify-otp')
  @HttpCode(200)
  verifyOTP(@Body() data: OTPPayload) {
    return this.adminAuthService.verifyOTP(data);
  }

  @Post('/refresh')
  @HttpCode(200)
  refreshToken(@Body() payload: RefreshTokenPayload) {
    return this.adminAuthService.refreshToken(payload);
  }

  @Post('/logout')
  @UseGuards(AdminJwtAuth)
  @HttpCode(200)
  logout(@User('sub') userId: number, @Req() req: Request) {
    const token = req.headers.authorization!.split(' ')[1];

    return this.adminAuthService.logout(userId, token);
  }
}
