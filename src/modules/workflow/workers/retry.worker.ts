import { QueueJob } from '../../queue/providers/queue-provider.interface';
import { ExecutionService } from '../services/execution.service';

const executionService = new ExecutionService();

export const RetryWorker = async (job: QueueJob, _context: any) => {
  const { executionId, nodeId, approvalData } = job.payload.payload;
  if (!executionId || !nodeId) {
    throw new Error('Missing executionId or nodeId in retry payload');
  }

  await job.log(`Retrying execution ${executionId} starting at node ${nodeId}`);
  await executionService.resumeExecution(executionId, nodeId, approvalData || {});
  await job.updateProgress(100);
};
