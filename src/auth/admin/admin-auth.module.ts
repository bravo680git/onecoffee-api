import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AdminAuthService } from './admin-auth.service';
import { JwtService } from '@nestjs/jwt';
import { AdminJwtStrategy } from './admin-jwt.strategy';
import { AdminAuthController } from './admin-auth.controller';

@Module({
  imports: [UserModule],
  providers: [AdminAuthService, JwtService, AdminJwtStrategy],
  controllers: [AdminAuthController],
})
export class AdminAuthModule {}
