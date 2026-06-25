import { Job } from 'bullmq';
import { CoordinationEngine } from '../engine/coordination.engine';
import { MonitoringEngine } from '../engine/monitoring.engine';

const coordinationEngine = new CoordinationEngine();
const monitoringEngine = new MonitoringEngine();

export class DelegationWorker {
  public async processJob(job: Job): Promise<any> {
    const { sourceAgentId, targetAgentId, taskDefinition, executionId } = job.data;
    
    try {
      const delegationId = await coordinationEngine.delegateTask(sourceAgentId, targetAgentId, taskDefinition);
      await monitoringEngine.logEvent(executionId, 'INFO', `Delegated task to agent ${targetAgentId}`, { delegationId });
      return delegationId;
    } catch (error: any) {
      await monitoringEngine.logEvent(executionId, 'ERROR', `Delegation failed to agent ${targetAgentId}`, { error: error.message });
      throw error;
    }
  }
}
