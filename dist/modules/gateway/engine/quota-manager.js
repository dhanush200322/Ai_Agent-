"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaManager = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class QuotaManager {
    /**
     * Records usage asynchronously to prepare for Phase 6.13 Billing
     */
    recordUsage(organizationId, metric, amount = 1) {
        const updateData = {};
        updateData[metric] = { increment: amount };
        prisma.usageQuota.upsert({
            where: { organizationId },
            update: updateData,
            create: {
                organizationId,
                tokensUsed: metric === 'tokensUsed' ? amount : 0,
                requestsCount: metric === 'requestsCount' ? amount : 0,
                workflowsRun: metric === 'workflowsRun' ? amount : 0,
                toolCalls: metric === 'toolCalls' ? amount : 0
            }
        }).catch((e) => console.error(`[QuotaManager] Failed to record usage`, e));
    }
}
exports.QuotaManager = QuotaManager;
