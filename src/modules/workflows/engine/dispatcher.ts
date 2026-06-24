import { WorkflowExecutionContext } from './context';
import { WorkflowRunner } from './runner';

export interface ExecutionDispatcher {
  dispatch(context: WorkflowExecutionContext, startNodeId?: string): Promise<void>;
  resume(context: WorkflowExecutionContext, nodeId: string, approvalData?: any): Promise<void>;
}

export class ImmediateDispatcher implements ExecutionDispatcher {
  private runner = new WorkflowRunner();

  async dispatch(context: WorkflowExecutionContext, startNodeId?: string): Promise<void> {
    // In a real queue like BullMQ, we would push a job here.
    // For immediate execution, we just run it inline.
    await this.runner.run(context, startNodeId);
  }

  async resume(context: WorkflowExecutionContext, nodeId: string, approvalData?: any): Promise<void> {
    await this.runner.resumeNode(context, nodeId, approvalData);
  }
}
