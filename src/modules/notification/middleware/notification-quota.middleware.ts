import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function checkNotificationQuota(req: Request, res: Response, next: NextFunction) {
  const organizationId = (req as any).user?.organizationId;
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
