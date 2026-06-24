import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../cache/cache.service';
import { REDIS_CONSTANTS } from '../../../config/redis.constants';

const prisma = new PrismaClient() as any;
const cache = new CacheService();

export class QuotaEngine {
  
  async checkQuota(organizationId: string, type: 'API_CALL' | 'CHAT_TOKENS' | 'WORKFLOW_EXECUTION', amount: number = 1): Promise<boolean> {
    const quotaKey = `${REDIS_CONSTANTS.NAMESPACES.QUOTA}${organizationId}:${type}`;
    
    // Attempt fast path via cache
    let currentUsage = await cache.get<number>(quotaKey);
    let limit = await cache.get<number>(`${quotaKey}:limit`);

    if (currentUsage === null || limit === null) {
      // Hydrate from Postgres
      const sub = await prisma.organizationSubscription.findUnique({
        where: { organizationId },
        include: { plan: true },
      });

      if (!sub || sub.status !== 'ACTIVE') return false;

      limit = type === 'API_CALL' ? sub.plan.maxApiCalls : 
              type === 'CHAT_TOKENS' ? Number(sub.plan.maxTokens) : 
              sub.plan.maxWorkflows;

      // For simplicity, we just set current usage to 0 for the month in this prototype,
      // but in production we would query UsageSummary
      currentUsage = 0;

      await cache.set(quotaKey, currentUsage, REDIS_CONSTANTS.TTL.SESSION);
      await cache.set(`${quotaKey}:limit`, limit, REDIS_CONSTANTS.TTL.SESSION);
    }

    if (currentUsage + amount > (limit || 0)) {
      return false;
    }

    return true;
  }

  async recordUsage(organizationId: string, type: string, amount: number = 1): Promise<void> {
    const quotaKey = `${REDIS_CONSTANTS.NAMESPACES.QUOTA}${organizationId}:${type}`;
    await cache.increment(quotaKey, amount);
  }
}
