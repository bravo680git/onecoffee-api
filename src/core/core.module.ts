import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MailModule } from './mail/mail.module';
import * as redisStore from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';

@Global()
@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore.create({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      }),
    }),
    MailModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService, CacheModule, MailModule],
})
export class CoreModule {}
