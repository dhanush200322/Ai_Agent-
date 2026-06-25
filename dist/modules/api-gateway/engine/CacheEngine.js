"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CacheEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheEngine = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let CacheEngine = CacheEngine_1 = class CacheEngine {
    logger = new common_1.Logger(CacheEngine_1.name);
    redis = new ioredis_1.Redis();
    async get(key) {
        this.logger.debug(`Fetching cache for ${key}`);
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    async set(key, value, ttlSecs = 300) {
        this.logger.debug(`Setting cache for ${key} (ttl: ${ttlSecs}s)`);
        await this.redis.set(key, JSON.stringify(value), 'EX', ttlSecs);
    }
    async invalidate(prefix) {
        this.logger.debug(`Invalidating cache pattern ${prefix}*`);
        const keys = await this.redis.keys(`${prefix}*`);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
};
exports.CacheEngine = CacheEngine;
exports.CacheEngine = CacheEngine = CacheEngine_1 = __decorate([
    (0, common_1.Injectable)()
], CacheEngine);
