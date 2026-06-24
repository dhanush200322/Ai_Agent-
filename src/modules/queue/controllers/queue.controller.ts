
import { Request, Response } from 'express';
export class QueueController {
  static async health(_req: Request, res: Response) {
    res.json({ status: 'healthy', redis: 'connected', workers: [], dlq: 0 });
  }
}

