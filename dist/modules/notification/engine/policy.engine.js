"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPolicyEngine = void 0;
const client_1 = require("@prisma/client");
const cache_service_1 = require("../../cache/cache.service");
const prisma = new client_1.PrismaClient();
class NotificationPolicyEngine {
    cache;
    constructor() {
        this.cache = new cache_service_1.CacheService();
    }
    async shouldSuppress(organizationId, recipient, body, suppressionWindowSec = 300) {
        const key = `notif_suppress:${organizationId}:${recipient}:${this.hash(body)}`;
        const cached = await this.cache.get(key);
        if (cached) {
            return true;
        }
        await this.cache.set(key, '1', suppressionWindowSec);
        return false;
    }
    async checkFrequencyLimits(organizationId, userId, limitPerHour = 100) {
        const key = userId
            ? `notif_limit:user:${userId}`
            : `notif_limit:org:${organizationId}`;
        const countStr = await this.cache.get(key);
        const count = countStr ? parseInt(countStr) : 0;
        if (count >= limitPerHour) {
            return false;
        }
        await this.cache.set(key, (count + 1).toString(), 3600);
        return true;
    }
    escalatePriority(currentPriority) {
        if (currentPriority === 'LOW')
            return 'NORMAL';
        if (currentPriority === 'NORMAL')
            return 'HIGH';
        return 'CRITICAL';
    }
    isBusinessHours(timezone = 'UTC') {
        const now = new Date();
        const day = now.getUTCDay();
        const hour = now.getUTCHours();
        if (day === 0 || day === 6)
            return false;
        return hour >= 9 && hour < 17;
    }
    hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString();
    }
}
exports.NotificationPolicyEngine = NotificationPolicyEngine;
