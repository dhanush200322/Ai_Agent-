import { RuntimeEngine } from '../engine/runtime.engine';
import { AgentExecutionInput } from '../types/runtime.types';
import { RegistryEngine } from '../engine/registry.engine';

export class AgentRuntimeService {
  private runtimeEngine = new RuntimeEngine();
  private registryEngine = new RegistryEngine();

  public async startExecution(organizationId: string, agentId: string, goal: string, sessionId?: string, variables?: Record<string, any>) {
    const input: AgentExecutionInput = { organizationId, agentId, sessionId, goal, variables };
    return await this.runtimeEngine.spawn(input);
  }

  public async pauseExecution(executionId: string) {
    await this.runtimeEngine.pause(executionId);
    return { success: true, status: 'PAUSED' };
  }

  public async resumeExecution(executionId: string) {
    await this.runtimeEngine.resume(executionId);
    return { success: true, status: 'RUNNING' };
  }

  public async cancelExecution(executionId: string) {
    await this.runtimeEngine.cancel(executionId);
    return { success: true, status: 'CANCELED' };
  }

  public async getAgentMetadata(organizationId: string, agentId: string) {
    return await this.registryEngine.getAgentMetadata(organizationId, agentId);
  }
}
