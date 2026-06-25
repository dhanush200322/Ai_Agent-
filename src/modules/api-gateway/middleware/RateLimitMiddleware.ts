import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimitEngine } from '../engine/RateLimitEngine';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly rateLimitEngine: RateLimitEngine) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const limitStatus = await this.rateLimitEngine.checkRateLimit(`ratelimit:${ip}`, 100, 60);
    
    res.setHeader('X-RateLimit-Limit', limitStatus.limit.toString());
    res.setHeader('X-RateLimit-Remaining', limitStatus.remaining.toString());

    if (!limitStatus.allowed) {
      return res.status(429).json({ error: 'Too Many Requests' });
    }
    return next();
  }
}
