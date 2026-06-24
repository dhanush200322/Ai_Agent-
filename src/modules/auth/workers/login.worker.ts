import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LoginWorker {
  async process(job: any): Promise<void> {
    const { userId, ipAddress, userAgent, mfa } = job.data;
    
    // Write an async telemetry log
    console.log(`[Queue] Processing login event for user ${userId}. MFA: ${mfa}`);
    
    // In a real system, we'd send data to DataDog or a telemetry service here
    // For now, we ensure the user exists and update a generic lastLogin flag
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' } // Touch the record
    });
  }
}

