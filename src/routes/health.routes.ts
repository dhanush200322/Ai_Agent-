import { prisma } from '../shared/prisma';
import { Router, Request, Response } from 'express';
import { ApiResponse } from '../shared/response/ApiResponse';
import { PrismaClient } from '@prisma/client';
import { RedisConnectionManager } from '../config/redis';
import { QdrantClient } from '@qdrant/js-client-rest';
import fs from 'fs';
import path from 'path';

const router = Router();

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

router.get('/', (req: Request, res: Response) => {
  res.status(200).json(ApiResponse.success({ status: 'OK' }, 'Health check passed', req.reqId));
});

router.get('/live', (req: Request, res: Response) => {
  res.status(200).json(ApiResponse.success({ status: 'healthy' }, 'Liveness check passed', req.reqId));
});

router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check DB
    await prisma.$queryRawUnsafe('SELECT 1');
    // Check Redis
    await RedisConnectionManager.ping();
    // Check Storage
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.accessSync(uploadDir, fs.constants.W_OK);

    res.status(200).json(ApiResponse.success({ status: 'ready' }, 'Readiness check passed', req.reqId));
  } catch (err: any) {
    res.status(503).json(ApiResponse.error(503, `Readiness check failed: ${err.message}`, req.reqId));
  }
});

router.get('/database', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.status(200).json(ApiResponse.success({ status: 'healthy', database: 'connected' }, 'Database check passed', req.reqId));
  } catch (err: any) {
    res.status(503).json(ApiResponse.error(503, `Database check failed: ${err.message}`, req.reqId));
  }
});

router.get('/redis', async (req: Request, res: Response) => {
  try {
    await RedisConnectionManager.ping();
    res.status(200).json(ApiResponse.success({ status: 'healthy', redis: 'connected' }, 'Redis check passed', req.reqId));
  } catch (err: any) {
    res.status(503).json(ApiResponse.error(503, `Redis check failed: ${err.message}`, req.reqId));
  }
});

router.get('/queue', async (req: Request, res: Response) => {
  try {
    // BullMQ requires Redis connection
    await RedisConnectionManager.ping();
    res.status(200).json(ApiResponse.success({ status: 'healthy', queue: 'active' }, 'Queue check passed', req.reqId));
  } catch (err: any) {
    res.status(503).json(ApiResponse.error(503, `Queue check failed: ${err.message}`, req.reqId));
  }
});

router.get('/ai', async (req: Request, res: Response) => {
  try {
    await qdrant.getCollections();
    res.status(200).json(ApiResponse.success({ status: 'healthy', ai: 'Qdrant connected' }, 'AI Vector DB check passed', req.reqId));
  } catch (err: any) {
    res.status(503).json(ApiResponse.error(503, `AI check failed: ${err.message}`, req.reqId));
  }
});

router.get('/storage', (req: Request, res: Response) => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.accessSync(uploadDir, fs.constants.W_OK);
    res.status(200).json(ApiResponse.success({ status: 'healthy', storage: 'writable' }, 'Storage check passed', req.reqId));
  } catch (err: any) {
    res.status(503).json(ApiResponse.error(503, `Storage check failed: ${err.message}`, req.reqId));
  }
});

export default router;

