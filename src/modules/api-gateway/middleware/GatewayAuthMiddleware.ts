import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiKeyEngine } from '../engine/ApiKeyEngine';

@Injectable()
export class GatewayAuthMiddleware implements NestMiddleware {
  constructor(private readonly apiKeyEngine: ApiKeyEngine) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ent_')) {
      const key = authHeader.replace('Bearer ', '');
      const valid = await this.apiKeyEngine.validateKey(key);
      if (valid) {
        (req as any).apiKey = valid;
        return next();
      }
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
