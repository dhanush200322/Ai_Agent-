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
exports.DashboardEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const common_1 = require("@nestjs/common");
const MetricsEngine_1 = require("./MetricsEngine");
let DashboardEngine = class DashboardEngine {
    metrics;
    prisma = prisma_1.prisma;
    constructor(metrics) {
        this.metrics = metrics;
    }
    async getSystemDashboard() {
        return {
            status: 'OK',
            metrics: await this.metrics.getMetrics()
        };
    }
    async getOrganizationDashboard(organizationId) {
        const alerts = await this.prisma.alert.findMany({ where: { organizationId } });
        return {
            activeAlerts: alerts.filter(a => !a.resolved).length,
            totalAlerts: alerts.length,
        };
    }
    async getAIDashboard(organizationId) {
        const tokens = await this.prisma.tokenAnalytics.findMany({ where: { organizationId } });
        return {
            totalTokens: tokens.reduce((sum, t) => sum + t.totalTokens, 0),
        };
    }
    async getWorkflowDashboard(organizationId) {
        const workflows = await this.prisma.workflowHealth.findMany();
        return { workflows };
    }
    async getRuntimeDashboard(organizationId) {
        const agents = await this.prisma.agentHealth.findMany();
        return { agents };
    }
    async getBillingDashboard(organizationId) {
        const costs = await this.prisma.costAnalytics.findMany({ where: { organizationId } });
        return {
            totalCostUsd: costs.reduce((sum, c) => sum + c.costUsd, 0)
        };
    }
    async getQueueDashboard() {
        return await this.prisma.queueHealth.findMany();
    }
    async getSecurityDashboard(organizationId) {
        return await this.prisma.alert.findMany({ where: { organizationId, severity: 'CRITICAL' } });
    }
    async getDeveloperDashboard() {
        return await this.prisma.errorLog.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
    }
};
exports.DashboardEngine = DashboardEngine;
exports.DashboardEngine = DashboardEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricsEngine_1.MetricsEngine])
], DashboardEngine);
