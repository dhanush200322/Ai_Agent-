"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const prisma_1 = require("../../../shared/prisma");
const redis_health_service_1 = require("./redis-health.service");
const redisHealth = new redis_health_service_1.RedisHealthService();
class HealthService {
    /**
     * Performs an immediate system liveness check (e.g. CPU/Memory non-blocking check).
     */
    async checkLiveness() {
        // True liveness usually just returns 200 immediately if event loop isn't blocked.
        this.recordHealth('Core Application', 'LIVENESS', 'HEALTHY', 1);
        return 'HEALTHY';
    }
    /**
     * Performs a comprehensive readiness check (ping DB, Redis, LLM, etc.)
     */
    async checkReadiness() {
        const dependencies = [];
        let overallStatus = 'HEALTHY';
        // 1. Database
        const startDb = Date.now();
        try {
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            dependencies.push({ name: 'Database', status: 'HEALTHY', latency: Date.now() - startDb });
            this.recordHealth('Database', 'READINESS', 'HEALTHY', Date.now() - startDb);
        }
        catch (e) {
            dependencies.push({ name: 'Database', status: 'UNHEALTHY', error: e.message });
            overallStatus = 'UNHEALTHY';
            this.recordHealth('Database', 'READINESS', 'UNHEALTHY', Date.now() - startDb, e.message);
        }
        // 2. Redis
        const startRedis = Date.now();
        try {
            const isRedisHealthy = await redisHealth.ping();
            if (isRedisHealthy) {
                dependencies.push({ name: 'Redis', status: 'HEALTHY', latency: Date.now() - startRedis });
                this.recordHealth('Redis', 'READINESS', 'HEALTHY', Date.now() - startRedis);
            }
            else {
                throw new Error('Redis ping failed');
            }
        }
        catch (e) {
            dependencies.push({ name: 'Redis', status: 'UNHEALTHY', error: e.message });
            overallStatus = 'UNHEALTHY';
            this.recordHealth('Redis', 'READINESS', 'UNHEALTHY', Date.now() - startRedis, e.message);
        }
        return { status: overallStatus, dependencies };
    }
    recordHealth(component, type, status, latency, message) {
        prisma_1.prisma.healthCheck.create({
            data: { component, type, status, latency, message }
        }).catch(err => console.error(`[HealthService] Failed to record health:`, err));
    }
}
exports.HealthService = HealthService;
