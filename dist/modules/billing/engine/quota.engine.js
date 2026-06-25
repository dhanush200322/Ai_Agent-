"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaEngine = void 0;
const client_1 = require("@prisma/client");
const cache_service_1 = require("../../cache/cache.service");
const redis_constants_1 = require("../../../config/redis.constants");
const prisma = new client_1.PrismaClient();
const cache = new cache_service_1.CacheService();
class QuotaEngine {
    async checkQuota(organizationId, type, amount = 1) {
        const quotaKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.QUOTA}${organizationId}:${type}`;
        // Attempt fast path via cache
        let currentUsage = await cache.get(quotaKey);
        let limit = await cache.get(`${quotaKey}:limit`);
        if (currentUsage === null || limit === null) {
            // Hydrate from Postgres
            const sub = await prisma.organizationSubscription.findUnique({
                where: { organizationId },
                include: { plan: true },
            });
            if (!sub || sub.status !== 'ACTIVE')
                return false;
            limit = type === 'API_CALL' ? sub.plan.maxApiCalls :
                type === 'CHAT_TOKENS' ? Number(sub.plan.maxTokens) :
                    sub.plan.maxWorkflows;
            // For simplicity, we just set current usage to 0 for the month in this prototype,
            // but in production we would query UsageSummary
            currentUsage = 0;
            await cache.set(quotaKey, currentUsage, redis_constants_1.REDIS_CONSTANTS.TTL.SESSION);
            await cache.set(`${quotaKey}:limit`, limit, redis_constants_1.REDIS_CONSTANTS.TTL.SESSION);
        }
        if (currentUsage + amount > (limit || 0)) {
            return false;
        }
        return true;
    }
    async recordUsage(organizationId, type, amount = 1) {
        const quotaKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.QUOTA}${organizationId}:${type}`;
        await cache.increment(quotaKey, amount);
    }
}
exports.QuotaEngine = QuotaEngine;
