import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimitEngine {
  private readonly logger = new Logger(RateLimitEngine.name);
  private redis = new Redis();

  async checkRateLimit(key: string, limit: number, windowSecs: number) {
    this.logger.debug(`Checking rate limit for ${key}`);
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, windowSecs);
    }
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      limit
    };
  }
}
