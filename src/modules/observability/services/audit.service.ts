import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditService {
  /**
   * Logs a critical business mutation asynchronously.
   */
  logEvent(organizationId: string, action: string, resource: string, resourceId: string, userId?: string, ipAddress?: string, userAgent?: string, metadata?: any): void {
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
