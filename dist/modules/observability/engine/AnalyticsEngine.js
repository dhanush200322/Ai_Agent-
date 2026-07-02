"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const common_1 = require("@nestjs/common");
let AnalyticsEngine = class AnalyticsEngine {
    prisma = prisma_1.prisma;
    async recordTokenUsage(organizationId, model, promptTokens, completionTokens) {
        await this.prisma.tokenAnalytics.create({
            data: {
                organizationId,
                model,
                promptTokens,
                completionTokens,
                totalTokens: promptTokens + completionTokens
            }
        });
    }
    async recordCost(organizationId, service, costUsd) {
        await this.prisma.costAnalytics.create({
            data: {
                organizationId,
                service,
                costUsd
            }
        });
    }
    async recordUsage(organizationId, metricName, value) {
        await this.prisma.usageAnalytics.create({
            data: {
                organizationId,
                metricName,
                value
            }
        });
    }
};
exports.AnalyticsEngine = AnalyticsEngine;
exports.AnalyticsEngine = AnalyticsEngine = __decorate([
    (0, common_1.Injectable)()
], AnalyticsEngine);
