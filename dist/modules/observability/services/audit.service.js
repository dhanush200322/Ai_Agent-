"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const prisma_1 = require("../../../shared/prisma");
class AuditService {
    /**
     * Logs a critical business mutation asynchronously.
     */
    logEvent(organizationId, action, resource, resourceId, userId, ipAddress, userAgent, metadata) {
        prisma_1.prisma.auditLog.create({
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
