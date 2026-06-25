import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CleanupWorker {
  public async processJob(job: Job): Promise<any> {
    const { retentionDays } = job.data;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - (retentionDays || 30));

    try {
      const deleted = await prisma.agentExecutionLog.deleteMany({
        where: { createdAt: { lt: dateThreshold } }
      });
      return { deletedLogs: deleted.count };
    } catch (error: any) {
      throw error;
    }
  }
}
