import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RiskEngine {
  async evaluateSessionRisk(userId: string, ipAddress: string, userAgent: string): Promise<number> {
    let riskScore = 0;

    const recentLogin = await prisma.loginHistory.findFirst({
      where: { userId, ipAddress, status: 'SUCCESS' }
    });

    if (!recentLogin) riskScore += 30; // New IP

    const recentAgent = await prisma.loginHistory.findFirst({
      where: { userId, userAgent, status: 'SUCCESS' }
    });

    if (!recentAgent) riskScore += 20; // New User Agent

    const recentFailures = await prisma.loginHistory.count({
      where: { 
        userId, 
        status: 'FAILED',
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }
      }
    });

    riskScore += recentFailures * 10;
    return Math.min(riskScore, 100);
  }

  async isDeviceTrusted(userId: string, deviceFingerprint: string): Promise<boolean> {
    const device = await prisma.trustedDevice.findUnique({
      where: { deviceFingerprint }
    });
    
    return !!device && device.userId === userId && device.trustLevel === 'TRUSTED';
  }
}
