import { QueueJob } from '../../queue/providers/queue-provider.interface';
import { ExecutionService } from '../services/execution.service';

const executionService = new ExecutionService();

export const WorkflowWorker = async (job: QueueJob, _context: any) => {
  await job.updateProgress(10);
  await job.log(`Starting background workflow execution for job ${job.id}`);

  const { workflowId, variables, agentId } = job.payload.payload;
  if (!workflowId) {
    throw new Error('Missing workflowId in worker payload');
  }

  await executionService.startExecution(workflowId, variables || {}, agentId);
  await job.updateProgress(100);
  await job.log('Workflow execution completed in background');
};
