import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisService extends Cache {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
    super();
    Object.assign(this, cache);
  }
}
