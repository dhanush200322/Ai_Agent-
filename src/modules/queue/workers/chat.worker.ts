
import { QueueJob } from '../providers/queue-provider.interface';
export const ChatWorker = async (_job: QueueJob, _context: any) => {
  await _job.updateProgress(10);
  await _job.log('Chat processing');
  await _job.updateProgress(100);
};

