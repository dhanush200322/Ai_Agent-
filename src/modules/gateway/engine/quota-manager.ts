import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class QuotaManager {
  /**
   * Records usage asynchronously to prepare for Phase 6.13 Billing
   */
  recordUsage(organizationId: string, metric: 'tokensUsed' | 'requestsCount' | 'workflowsRun' | 'toolCalls', amount: number = 1): void {
    const updateData: any = {};
    updateData[metric] = { increment: amount };

    (prisma as any).usageQuota.upsert({
      where: { organizationId },
      update: updateData,
      create: {
        organizationId,
        tokensUsed: metric === 'tokensUsed' ? amount : 0,
        requestsCount: metric === 'requestsCount' ? amount : 0,
        workflowsRun: metric === 'workflowsRun' ? amount : 0,
        toolCalls: metric === 'toolCalls' ? amount : 0
      }
    }).catch((e: any) => console.error(`[QuotaManager] Failed to record usage`, e));
  }
}
