
import { QueueJob } from '../providers/queue-provider.interface';
export const WorkflowWorker = async (_job: QueueJob, _context: any) => {
  await _job.updateProgress(50);
  await _job.log('Workflow running');
  await _job.updateProgress(100);
};

