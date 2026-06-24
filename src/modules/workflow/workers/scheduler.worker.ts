import { QueueJob } from '../../queue/providers/queue-provider.interface';
import { ExecutionService } from '../services/execution.service';

const executionService = new ExecutionService();

export const SchedulerWorker = async (job: QueueJob, _context: any) => {
  const { workflowId } = job.payload.payload;
  if (!workflowId) {
    throw new Error('Missing workflowId in schedule trigger payload');
  }

  await job.log(`Scheduler triggered execution for workflow: ${workflowId}`);
  await executionService.startExecution(workflowId, { triggerType: 'SCHEDULER' });
  await job.updateProgress(100);
};
