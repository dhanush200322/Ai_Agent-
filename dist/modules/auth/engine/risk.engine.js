"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
class RiskEngine {
    async evaluateSessionRisk(userId, ipAddress, userAgent) {
        let riskScore = 0;
        const recentLogin = await prisma_1.prisma.loginHistory.findFirst({
            where: { userId, ipAddress, status: 'SUCCESS' }
        });
        if (!recentLogin)
            riskScore += 30; // New IP
        const recentAgent = await prisma_1.prisma.loginHistory.findFirst({
            where: { userId, userAgent, status: 'SUCCESS' }
        });
        if (!recentAgent)
            riskScore += 20; // New User Agent
        const recentFailures = await prisma_1.prisma.loginHistory.count({
            where: {
                userId,
                status: 'FAILED',
                createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }
            }
        });
        riskScore += recentFailures * 10;
        return Math.min(riskScore, 100);
    }
    async isDeviceTrusted(userId, deviceFingerprint) {
        const device = await prisma_1.prisma.trustedDevice.findUnique({
            where: { deviceFingerprint }
        });
        return !!device && device.userId === userId && device.trustLevel === 'TRUSTED';
    }
}
exports.RiskEngine = RiskEngine;
