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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityController = void 0;
const prisma_1 = require("../../../shared/prisma");
const common_1 = require("@nestjs/common");
const HealthEngine_1 = require("../engine/HealthEngine");
const MetricsEngine_1 = require("../engine/MetricsEngine");
const DashboardEngine_1 = require("../engine/DashboardEngine");
const ProfilingEngine_1 = require("../engine/ProfilingEngine");
const AlertEngine_1 = require("../engine/AlertEngine");
let ObservabilityController = class ObservabilityController {
    healthEngine;
    metricsEngine;
    dashboardEngine;
    profilingEngine;
    alertEngine;
    prisma = prisma_1.prisma;
    constructor(healthEngine, metricsEngine, dashboardEngine, profilingEngine, alertEngine) {
        this.healthEngine = healthEngine;
        this.metricsEngine = metricsEngine;
        this.dashboardEngine = dashboardEngine;
        this.profilingEngine = profilingEngine;
        this.alertEngine = alertEngine;
    }
    async getHealth() {
        return await this.healthEngine.checkDeepHealth();
    }
    async getMetrics() {
        return await this.metricsEngine.getMetrics();
    }
    async getTraces() {
        return { status: 'Exported via OTLP' };
    }
    async getLogs(orgId) {
        if (orgId) {
            return await this.prisma.errorLog.findMany({ where: { organizationId: orgId }, take: 100, orderBy: { createdAt: 'desc' } });
        }
        return await this.prisma.errorLog.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
    }
    async getErrors() {
        return await this.prisma.exceptionEvent.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
    }
    async getAlerts(orgId) {
        const where = orgId ? { organizationId: orgId } : {};
        return await this.prisma.alert.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async getDashboard(type, orgId) {
        switch (type) {
            case 'SYSTEM': return await this.dashboardEngine.getSystemDashboard();
            case 'ORGANIZATION': return await this.dashboardEngine.getOrganizationDashboard(orgId || '');
            case 'AI': return await this.dashboardEngine.getAIDashboard(orgId || '');
            case 'WORKFLOW': return await this.dashboardEngine.getWorkflowDashboard(orgId || '');
            case 'RUNTIME': return await this.dashboardEngine.getRuntimeDashboard(orgId || '');
            case 'BILLING': return await this.dashboardEngine.getBillingDashboard(orgId || '');
            case 'QUEUE': return await this.dashboardEngine.getQueueDashboard();
            case 'SECURITY': return await this.dashboardEngine.getSecurityDashboard(orgId || '');
            case 'DEVELOPER': return await this.dashboardEngine.getDeveloperDashboard();
            default: return await this.dashboardEngine.getSystemDashboard();
        }
    }
    async getAnalytics(orgId) {
        if (orgId) {
            return await this.prisma.usageAnalytics.findMany({ where: { organizationId: orgId }, take: 100, orderBy: { timestamp: 'desc' } });
        }
        return await this.prisma.usageAnalytics.findMany({ take: 100, orderBy: { timestamp: 'desc' } });
    }
    async getProfiling() {
        return await this.prisma.performanceProfile.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
    }
    async createAlertRule(body) {
        return await this.prisma.alertRule.create({ data: body });
    }
    async updateAlertRule(id, body) {
        return await this.prisma.alertRule.update({ where: { id }, data: body });
    }
    async deleteAlertRule(id) {
        return await this.prisma.alertRule.delete({ where: { id } });
    }
};
exports.ObservabilityController = ObservabilityController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('traces'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getTraces", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('errors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getErrors", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('profiling'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getProfiling", null);
__decorate([
    (0, common_1.Post)('alerts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "createAlertRule", null);
__decorate([
    (0, common_1.Put)('alerts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "updateAlertRule", null);
__decorate([
    (0, common_1.Delete)('alerts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "deleteAlertRule", null);
exports.ObservabilityController = ObservabilityController = __decorate([
    (0, common_1.Controller)('api/v1/observability'),
    __metadata("design:paramtypes", [HealthEngine_1.HealthEngine,
        MetricsEngine_1.MetricsEngine,
        DashboardEngine_1.DashboardEngine,
        ProfilingEngine_1.ProfilingEngine,
        AlertEngine_1.AlertEngine])
], ObservabilityController);
