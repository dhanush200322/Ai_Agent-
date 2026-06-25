"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitEngine = void 0;
const client_1 = require("@prisma/client");
const rate_limit_store_1 = require("./rate-limit-store");
const prisma = new client_1.PrismaClient();
class RateLimitEngine {
    store;
    constructor(store) {
        this.store = store || new rate_limit_store_1.MemoryRateLimitStore();
    }
    /**
     * Enforces hierarchical limits.
     * Finds the most restrictive applicable policy and applies it.
     */
    async checkRateLimit(organizationId, userId, apiKeyId) {
        // Note: In a real system, you'd cache policies in memory.
        const policies = await prisma.rateLimitPolicy.findMany({
            where: {
                OR: [
                    { organizationId },
                    { userId },
                    { apiKeyId }
                ]
            }
        });
        if (policies.length === 0)
            return { allowed: true };
        // Find most restrictive policy (min requests per minute)
        const strictest = policies.reduce((min, p) => {
            if (!p.requestsPerMinute)
                return min;
            if (!min.requestsPerMinute)
                return p;
            return p.requestsPerMinute < min.requestsPerMinute ? p : min;
        }, {});
        if (!strictest.requestsPerMinute)
            return { allowed: true };
        const key = `rl_org_${organizationId}_min`;
        const currentCount = await this.store.increment(key, 60); // 60 seconds
        if (currentCount > strictest.requestsPerMinute) {
            return { allowed: false, reason: `Rate limit exceeded. Max ${strictest.requestsPerMinute} requests per minute.` };
        }
        return { allowed: true };
    }
}
exports.RateLimitEngine = RateLimitEngine;
