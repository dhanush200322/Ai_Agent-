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
exports.HealthEngine = exports.HealthStatus = void 0;
const prisma_1 = require("../../../shared/prisma");
const common_1 = require("@nestjs/common");
const LoggingEngine_1 = require("./LoggingEngine");
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "HEALTHY";
    HealthStatus["DEGRADED"] = "DEGRADED";
    HealthStatus["DOWN"] = "DOWN";
})(HealthStatus || (exports.HealthStatus = HealthStatus = {}));
let HealthEngine = class HealthEngine {
    logger;
    prisma = prisma_1.prisma;
    constructor(logger) {
        this.logger = logger;
    }
    async checkLiveness() {
        return HealthStatus.HEALTHY;
    }
    async checkReadiness() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return HealthStatus.HEALTHY;
        }
        catch (e) {
            this.logger.error('Database readiness failed', e.stack, 'HealthEngine');
            return HealthStatus.DOWN;
        }
    }
    async checkStartup() {
        return HealthStatus.HEALTHY;
    }
    async checkDeepHealth() {
        const db = await this.checkReadiness();
        return {
            database: db,
            redis: HealthStatus.HEALTHY,
            queue: HealthStatus.HEALTHY
        };
    }
    async recordHealthCheck(component, type, status, latency, message) {
        await this.prisma.healthCheck.create({
            data: {
                component,
                type,
                status: status,
                latency,
                message
            }
        });
    }
};
exports.HealthEngine = HealthEngine;
exports.HealthEngine = HealthEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [LoggingEngine_1.LoggingEngine])
], HealthEngine);
