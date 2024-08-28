import { Module } from '@nestjs/common';
import { AdminAuthModule } from './admin/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
})
export class AuthModule {}
