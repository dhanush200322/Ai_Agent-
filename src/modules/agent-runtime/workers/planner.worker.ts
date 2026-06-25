import { Job } from 'bullmq';
import { PlanningEngine } from '../engine/planning.engine';
import { MonitoringEngine } from '../engine/monitoring.engine';

const planningEngine = new PlanningEngine();
const monitoringEngine = new MonitoringEngine();

export class PlannerWorker {
  public async processJob(job: Job): Promise<any> {
    const { executionId, goal, context, organizationId } = job.data;
    
    try {
      const plan = await planningEngine.generatePlan(goal, context);
      await monitoringEngine.logEvent(executionId, 'INFO', 'Plan generated', { plan });
      return plan;
    } catch (error: any) {
      await monitoringEngine.logEvent(executionId, 'ERROR', 'Plan generation failed', { error: error.message });
      throw error;
    }
  }
}
