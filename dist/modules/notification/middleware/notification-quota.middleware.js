"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNotificationQuota = checkNotificationQuota;
const prisma_1 = require("../../../shared/prisma");
async function checkNotificationQuota(req, res, next) {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID not found in token' });
    }
    const org = await prisma_1.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org || org.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Organization is not active or suspended' });
    }
    const quota = await prisma_1.prisma.usageQuota.findUnique({ where: { organizationId } });
    if (quota) {
        if (quota.requestsCount >= BigInt(1000000)) {
            return res.status(429).json({ error: 'Monthly notification quota exceeded' });
        }
    }
    next();
    return;
}
