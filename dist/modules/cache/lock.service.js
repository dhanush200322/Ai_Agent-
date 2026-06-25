"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockService = void 0;
const redis_1 = require("../../config/redis");
const redis_constants_1 = require("../../config/redis.constants");
const uuid_1 = require("uuid");
class LockService {
    get client() {
        return redis_1.RedisConnectionManager.getClient();
    }
    async acquire(key, ttlMs = redis_constants_1.REDIS_CONSTANTS.TTL.LOCK_DEFAULT) {
        const lockValue = (0, uuid_1.v4)();
        const lockKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.LOCK}${key}`;
        const acquired = await this.client.set(lockKey, lockValue, 'PX', ttlMs, 'NX');
        return acquired === 'OK' ? lockValue : null;
    }
    async release(key, lockValue) {
        const lockKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.LOCK}${key}`;
        // Lua script ensures we only delete the lock if we own it
        const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
        const result = await this.client.eval(script, 1, lockKey, lockValue);
        return result === 1;
    }
    async extend(key, lockValue, ttlMs) {
        const lockKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.LOCK}${key}`;
        const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("pexpire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;
        const result = await this.client.eval(script, 1, lockKey, lockValue, ttlMs);
        return result === 1;
    }
}
exports.LockService = LockService;
