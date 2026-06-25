import { Job } from 'bullmq';
import { ExecutionEngine } from '../engine/execution.engine';
import { RuntimeEngine } from '../engine/runtime.engine';
import { MonitoringEngine } from '../engine/monitoring.engine';

const executionEngine = new ExecutionEngine();
const runtimeEngine = new RuntimeEngine();
const monitoringEngine = new MonitoringEngine();

export class ExecutionWorker {
  public async processJob(job: Job): Promise<any> {
    const { executionId, stepId, action, organizationId } = job.data;
    
    try {
      const result = await executionEngine.executeStep(executionId, stepId, action);
      await monitoringEngine.logEvent(executionId, 'INFO', `Step ${stepId} executed`, { action, result });
      return result;
    } catch (error: any) {
      await monitoringEngine.logEvent(executionId, 'ERROR', `Step ${stepId} failed`, { action, error: error.message });
      // Depending on retry logic, might trigger RetryWorker
      throw error;
    }
  }
}
