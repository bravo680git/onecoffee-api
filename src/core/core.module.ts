import { Global, Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Global()
@Module({
  imports: [MailModule, RedisModule, PrismaModule],
  exports: [PrismaModule, MailModule, RedisModule],
})
export class CoreModule {}
