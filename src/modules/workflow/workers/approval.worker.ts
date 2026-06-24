import { QueueJob } from '../../queue/providers/queue-provider.interface';
import { ApprovalEngine } from '../engine/approval.engine';

const approvalEngine = new ApprovalEngine();

export const ApprovalWorker = async (job: QueueJob, _context: any) => {
  await job.log('Checking for expired workflow approvals...');
  const expiredCount = await approvalEngine.checkApprovalTimeouts();
  await job.log(`Marked ${expiredCount} approvals as expired.`);
  await job.updateProgress(100);
};
