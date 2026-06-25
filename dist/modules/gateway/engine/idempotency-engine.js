"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyEngine = exports.MemoryCacheStore = void 0;
class MemoryCacheStore {
    store = new Map();
    async get(key) {
        const record = this.store.get(key);
        if (!record)
            return null;
        if (Date.now() > record.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return record.value;
    }
    async set(key, value, ttlSeconds) {
        this.store.set(key, { value, expiresAt: Date.now() + (ttlSeconds * 1000) });
    }
}
exports.MemoryCacheStore = MemoryCacheStore;
class IdempotencyEngine {
    store;
    constructor(store) {
        this.store = store || new MemoryCacheStore();
    }
    async checkIdempotency(key) {
        const cached = await this.store.get(`idemp_${key}`);
        if (cached) {
            return { isDuplicate: true, response: JSON.parse(cached) };
        }
        return { isDuplicate: false };
    }
    async saveResponse(key, response) {
        await this.store.set(`idemp_${key}`, JSON.stringify(response), 86400); // 24 hours
    }
}
exports.IdempotencyEngine = IdempotencyEngine;
