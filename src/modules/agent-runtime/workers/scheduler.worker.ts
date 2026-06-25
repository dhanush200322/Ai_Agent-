import { Job } from 'bullmq';
import { RuntimeEngine } from '../engine/runtime.engine';
import { MonitoringEngine } from '../engine/monitoring.engine';

const runtimeEngine = new RuntimeEngine();
const monitoringEngine = new MonitoringEngine();

export class SchedulerWorker {
  public async processJob(job: Job): Promise<any> {
    const { executionId, agentId, goal, organizationId } = job.data;
    
    try {
      if (executionId) {
        // Delayed execution continuation
        await runtimeEngine.resume(executionId);
        await monitoringEngine.logEvent(executionId, 'INFO', 'Resumed scheduled execution');
        return { action: 'RESUMED', executionId };
      } else if (agentId && goal) {
        // New scheduled execution
        const result = await runtimeEngine.spawn({ organizationId, agentId, goal });
        return { action: 'SPAWNED', executionId: result.executionId };
      }
    } catch (error: any) {
      throw error;
    }
  }
}
