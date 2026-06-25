"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RateLimitEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitEngine = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let RateLimitEngine = RateLimitEngine_1 = class RateLimitEngine {
    logger = new common_1.Logger(RateLimitEngine_1.name);
    redis = new ioredis_1.Redis();
    async checkRateLimit(key, limit, windowSecs) {
        this.logger.debug(`Checking rate limit for ${key}`);
        const count = await this.redis.incr(key);
        if (count === 1) {
            await this.redis.expire(key, windowSecs);
        }
        return {
            allowed: count <= limit,
            remaining: Math.max(0, limit - count),
            limit
        };
    }
};
exports.RateLimitEngine = RateLimitEngine;
exports.RateLimitEngine = RateLimitEngine = RateLimitEngine_1 = __decorate([
    (0, common_1.Injectable)()
], RateLimitEngine);
