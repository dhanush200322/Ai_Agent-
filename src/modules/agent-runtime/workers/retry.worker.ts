import { Job } from 'bullmq';
import { ExecutionEngine } from '../engine/execution.engine';
import { MonitoringEngine } from '../engine/monitoring.engine';

const executionEngine = new ExecutionEngine();
const monitoringEngine = new MonitoringEngine();

export class RetryWorker {
  public async processJob(job: Job): Promise<any> {
    const { executionId, stepId, action, maxRetries } = job.data;
    
    try {
      await monitoringEngine.logEvent(executionId, 'INFO', `Retrying step ${stepId}`);
      const result = await executionEngine.executeWithRetry(executionId, action, maxRetries);
      return result;
    } catch (error: any) {
      await monitoringEngine.logEvent(executionId, 'ERROR', `Retry exhausted for step ${stepId}`, { error: error.message });
      throw error;
    }
  }
}
