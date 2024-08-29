import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtStrategy } from './admin-jwt.strategy';

@Module({
  imports: [UserModule, JwtModule],
  providers: [AdminAuthService, AdminJwtStrategy],
  controllers: [AdminAuthController],
})
export class AdminAuthModule {}
