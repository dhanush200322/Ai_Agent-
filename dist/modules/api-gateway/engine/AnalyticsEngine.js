"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AnalyticsEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const common_1 = require("@nestjs/common");
let AnalyticsEngine = AnalyticsEngine_1 = class AnalyticsEngine {
    logger = new common_1.Logger(AnalyticsEngine_1.name);
    prisma = prisma_1.prisma;
    async recordApiUsage(apiKeyId, endpoint, method, statusCode, latencyMs) {
        this.logger.debug(`Recording API Usage for key ${apiKeyId}`);
        return this.prisma.apiUsage.create({
            data: { apiKeyId, endpoint, method, statusCode, latencyMs }
        });
    }
    async getAnalytics(apiKeyId) {
        return this.prisma.apiAnalytics.findMany({
            where: { apiKeyId }
        });
    }
};
exports.AnalyticsEngine = AnalyticsEngine;
exports.AnalyticsEngine = AnalyticsEngine = AnalyticsEngine_1 = __decorate([
    (0, common_1.Injectable)()
], AnalyticsEngine);
