import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';

@Global()
@Module({
  imports: [RedisModule, MailModule, PrismaModule],
  exports: [RedisModule, MailModule, PrismaModule],
})
export class CoreModule {}
