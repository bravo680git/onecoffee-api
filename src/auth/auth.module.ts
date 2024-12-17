import { Global, Module } from '@nestjs/common';
import { AuthModule as AdminAuthModule } from './admin/auth.module';

@Global()
@Module({
  imports: [AdminAuthModule],
  exports: [AdminAuthModule],
})
export class AuthModule {}
