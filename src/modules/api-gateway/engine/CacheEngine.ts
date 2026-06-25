import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheEngine {
  private readonly logger = new Logger(CacheEngine.name);
  private redis = new Redis();

  async get(key: string): Promise<any> {
    this.logger.debug(`Fetching cache for ${key}`);
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSecs: number = 300) {
    this.logger.debug(`Setting cache for ${key} (ttl: ${ttlSecs}s)`);
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSecs);
  }

  async invalidate(prefix: string) {
    this.logger.debug(`Invalidating cache pattern ${prefix}*`);
    const keys = await this.redis.keys(`${prefix}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
