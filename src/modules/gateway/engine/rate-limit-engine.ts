import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';
import { RateLimitStore, MemoryRateLimitStore } from './rate-limit-store';



export class RateLimitEngine {
  private store: RateLimitStore;

  constructor(store?: RateLimitStore) {
    this.store = store || new MemoryRateLimitStore();
  }

  /**
   * Enforces hierarchical limits. 
   * Finds the most restrictive applicable policy and applies it.
   */
  async checkRateLimit(organizationId: string, userId?: string, apiKeyId?: string): Promise<{ allowed: boolean, reason?: string }> {
    // Note: In a real system, you'd cache policies in memory.
    const policies = await (prisma as any).rateLimitPolicy.findMany({
      where: {
        OR: [
          { organizationId },
          { userId },
          { apiKeyId }
        ]
      }
    });

    if (policies.length === 0) return { allowed: true };

    // Find most restrictive policy (min requests per minute)
    const strictest = policies.reduce((min: any, p: any) => {
      if (!p.requestsPerMinute) return min;
      if (!min.requestsPerMinute) return p;
      return p.requestsPerMinute < min.requestsPerMinute ? p : min;
    }, {});

    if (!strictest.requestsPerMinute) return { allowed: true };

    const key = `rl_org_${organizationId}_min`;
    const currentCount = await this.store.increment(key, 60); // 60 seconds

    if (currentCount > strictest.requestsPerMinute) {
      return { allowed: false, reason: `Rate limit exceeded. Max ${strictest.requestsPerMinute} requests per minute.` };
    }

    return { allowed: true };
  }
}
