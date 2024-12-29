import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthAdminController, AuthUserController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [UserModule, JwtModule],
  providers: [AuthService],
  controllers: [AuthAdminController, AuthUserController],
  exports: [AuthService],
})
export class AuthModule {}
