import { Job } from 'bullmq';
import { MemoryEngine } from '../engine/memory.engine';

const memoryEngine = new MemoryEngine();

export class MemoryWorker {
  public async processJob(job: Job): Promise<any> {
    const { action, organizationId, agentId, conversationId, content } = job.data;
    
    try {
      if (action === 'ADD_EPISODIC') {
        await memoryEngine.addEpisodicMemory(organizationId, agentId, conversationId, content);
      } else if (action === 'SUMMARIZE_SESSION') {
        return await memoryEngine.summarizeSession(organizationId, agentId, conversationId);
      }
    } catch (error: any) {
      throw error;
    }
  }
}
