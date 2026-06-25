"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
const RateLimitEngine_1 = require("../engine/RateLimitEngine");
let RateLimitMiddleware = class RateLimitMiddleware {
    rateLimitEngine;
    constructor(rateLimitEngine) {
        this.rateLimitEngine = rateLimitEngine;
    }
    async use(req, res, next) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const limitStatus = await this.rateLimitEngine.checkRateLimit(`ratelimit:${ip}`, 100, 60);
        res.setHeader('X-RateLimit-Limit', limitStatus.limit.toString());
        res.setHeader('X-RateLimit-Remaining', limitStatus.remaining.toString());
        if (!limitStatus.allowed) {
            return res.status(429).json({ error: 'Too Many Requests' });
        }
        return next();
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [RateLimitEngine_1.RateLimitEngine])
], RateLimitMiddleware);
