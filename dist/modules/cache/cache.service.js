"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const redis_1 = require("../../config/redis");
const redis_constants_1 = require("../../config/redis.constants");
class CacheService {
    get client() {
        return redis_1.RedisConnectionManager.getClient();
    }
    async get(key) {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }
    async set(key, value, ttlSeconds = redis_constants_1.REDIS_CONSTANTS.TTL.CACHE_SHORT) {
        const stringValue = JSON.stringify(value);
        await this.client.set(key, stringValue, 'EX', ttlSeconds);
    }
    async del(key) {
        await this.client.del(key);
    }
    async exists(key) {
        const count = await this.client.exists(key);
        return count > 0;
    }
    async ttl(key) {
        return await this.client.ttl(key);
    }
    async expire(key, ttlSeconds) {
        await this.client.expire(key, ttlSeconds);
    }
    async increment(key, by = 1) {
        return await this.client.incrby(key, by);
    }
    async decrement(key, by = 1) {
        return await this.client.decrby(key, by);
    }
    async flushPattern(pattern) {
        let cursor = '0';
        do {
            const result = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = result[0];
            const keys = result[1];
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
        } while (cursor !== '0');
    }
}
exports.CacheService = CacheService;
