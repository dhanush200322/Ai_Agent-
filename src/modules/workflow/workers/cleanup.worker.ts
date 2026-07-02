import { prisma } from '../../../shared/prisma';
import { QueueJob } from '../../queue/providers/queue-provider.interface';
import { PrismaClient } from '@prisma/client';



export const CleanupWorker = async (job: QueueJob, _context: any) => {
  await job.log('Starting execution logs cleanup...');
  
  // Clean up completed executions older than 30 days
  const thresholdDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const deletedLogs = await prisma.workflowExecution.deleteMany({
    where: {
      status: 'COMPLETED',
      finishedAt: { lt: thresholdDate }
    }
  });

  await job.log(`Cleaned up ${deletedLogs.count} historical executions.`);
  await job.updateProgress(100);
};
