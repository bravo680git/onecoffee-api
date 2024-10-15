import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';
import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore.create({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
