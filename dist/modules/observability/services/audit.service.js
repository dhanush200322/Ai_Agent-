"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuditService {
    /**
     * Logs a critical business mutation asynchronously.
     */
    logEvent(organizationId, action, resource, resourceId, userId, ipAddress, userAgent, metadata) {
        prisma.auditLog.create({
            data: {
                organizationId,
                userId,
                action,
                resource,
                resourceId,
                ipAddress,
                userAgent,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        }).catch(err => {
            console.error(`[AuditService] Failed to write audit log for ${action}:`, err);
        });
    }
}
exports.AuditService = AuditService;
