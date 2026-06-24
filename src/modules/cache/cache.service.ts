import { RedisConnectionManager } from '../../config/redis';
import { REDIS_CONSTANTS } from '../../config/redis.constants';

export class CacheService {
  private get client() {
    return RedisConnectionManager.getClient();
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSeconds: number = REDIS_CONSTANTS.TTL.CACHE_SHORT): Promise<void> {
    const stringValue = JSON.stringify(value);
    await this.client.set(key, stringValue, 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const count = await this.client.exists(key);
    return count > 0;
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async increment(key: string, by: number = 1): Promise<number> {
    return await this.client.incrby(key, by);
  }

  async decrement(key: string, by: number = 1): Promise<number> {
    return await this.client.decrby(key, by);
  }

  async flushPattern(pattern: string): Promise<void> {
    let cursor = '0';
    do {
      const result = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } while (cursor !== '0');
  }
}
