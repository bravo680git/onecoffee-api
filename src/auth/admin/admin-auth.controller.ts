import { Body, Controller, Post } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { LoginPayload, OTPPayload } from '../dto/auth.input';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  adminLogin(@Body() data: LoginPayload) {
    return this.adminAuthService.login(data);
  }

  @Post('/verify-otp')
  verifyOTP(@Body() data: OTPPayload) {
    return this.adminAuthService.verifyOTP(data);
  }
}
