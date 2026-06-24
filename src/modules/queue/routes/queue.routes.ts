
import { Router } from 'express';
import { QueueController } from '../controllers/queue.controller';
export const queueRouter = Router();
queueRouter.get('/health', QueueController.health);
