"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryRateLimitStore = void 0;
class MemoryRateLimitStore {
    store = new Map();
    async increment(key, windowSeconds) {
        const now = Date.now();
        let record = this.store.get(key);
        if (!record || record.resetAt < now) {
            record = { count: 0, resetAt: now + (windowSeconds * 1000) };
        }
        record.count++;
        this.store.set(key, record);
        return record.count;
    }
}
exports.MemoryRateLimitStore = MemoryRateLimitStore;
