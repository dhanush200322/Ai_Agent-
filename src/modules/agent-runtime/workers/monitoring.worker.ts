import { Job } from 'bullmq';
import { MonitoringEngine } from '../engine/monitoring.engine';

const monitoringEngine = new MonitoringEngine();

export class MonitoringWorker {
  public async processJob(job: Job): Promise<any> {
    const { executionId, level, message, metadata, organizationId, metrics } = job.data;
    
    try {
      if (metrics) {
        await monitoringEngine.logMetrics(organizationId, executionId, metrics);
      }
      
      if (message) {
        await monitoringEngine.logEvent(executionId, level || 'INFO', message, metadata);
      }
      
      return { success: true };
    } catch (error: any) {
      throw error;
    }
  }
}
