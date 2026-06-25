"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNotificationQuota = checkNotificationQuota;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkNotificationQuota(req, res, next) {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID not found in token' });
    }
    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org || org.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Organization is not active or suspended' });
    }
    const quota = await prisma.usageQuota.findUnique({ where: { organizationId } });
    if (quota) {
        if (quota.requestsCount >= BigInt(1000000)) {
            return res.status(429).json({ error: 'Monthly notification quota exceeded' });
        }
    }
    next();
    return;
}
