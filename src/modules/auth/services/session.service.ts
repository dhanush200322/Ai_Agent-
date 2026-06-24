import { PrismaClient, SessionStatus } from '@prisma/client';
import { RedisConnectionManager } from '../../../config/redis';
import { REDIS_CONSTANTS } from '../../../config/redis.constants';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

export class SessionService {
  private get redis() {
    return RedisConnectionManager.getClient();
  }

  async createSession(userId: string, ipAddress: string, userAgent: string, deviceId?: string): Promise<any> {
    const sessionId = crypto.randomUUID();
    const tokenFingerprint = crypto.randomBytes(32).toString('hex');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days timeout

    // Create in DB
    const session = await prisma.userSession.create({
      data: {
        id: sessionId,
        userId,
        deviceId,
        tokenFingerprint,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        expiresAt,
        status: 'ACTIVE'
      }
    });

    // Create in Redis
    const cacheKey = `${REDIS_CONSTANTS.NAMESPACES.SESSION}${sessionId}`;
    await this.redis.setex(cacheKey, REDIS_CONSTANTS.TTL.SESSION * 7, JSON.stringify(session));

    return session;
  }

  async getSession(sessionId: string): Promise<any> {
    const cacheKey = `${REDIS_CONSTANTS.NAMESPACES.SESSION}${sessionId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const session = await prisma.userSession.findUnique({ where: { id: sessionId } });
    if (session) {
      await this.redis.setex(cacheKey, REDIS_CONSTANTS.TTL.SESSION * 7, JSON.stringify(session));
    }
    return session;
  }

  async revokeSession(sessionId: string): Promise<void> {
    // Revoke in DB
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { status: 'REVOKED' }
    });

    // Remove from Redis
    const cacheKey = `${REDIS_CONSTANTS.NAMESPACES.SESSION}${sessionId}`;
    await this.redis.del(cacheKey);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const sessions = await prisma.userSession.findMany({ where: { userId, status: 'ACTIVE' } });
    for (const s of sessions) {
      await this.revokeSession(s.id);
    }
  }

  async listActiveSessions(userId: string): Promise<any[]> {
    return prisma.userSession.findMany({ where: { userId, status: 'ACTIVE' } });
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session || session.status !== 'ACTIVE' || new Date(session.expiresAt) < new Date()) {
      return false;
    }
    // Update last activity (Sliding Expiration)
    await this.updateActivity(sessionId);
    return true;
  }

  async updateActivity(sessionId: string): Promise<void> {
     const cacheKey = `${REDIS_CONSTANTS.NAMESPACES.SESSION}${sessionId}`;
     await this.redis.expire(cacheKey, REDIS_CONSTANTS.TTL.SESSION * 7);
     await prisma.userSession.update({
       where: { id: sessionId },
       data: { lastActivityAt: new Date() }
     });
  }
}
