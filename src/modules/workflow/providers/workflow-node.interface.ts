import { WorkflowExecutionContext } from '../engine/context.engine';

export interface NodeExecutionResult {
  status: 'COMPLETED' | 'FAILED' | 'PAUSED' | 'SKIPPED';
  output?: Record<string, any>;
  error?: string;
  nextNodes?: string[]; // List of custom nodeIds to execute next
}

export interface WorkflowNodeInterface {
  type: string;
  
  execute(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult>;
  
  validate(node: any): string[] | null;
  
  rollback?(node: any, context: WorkflowExecutionContext): Promise<void>;
  
  resume?(node: any, context: WorkflowExecutionContext, approvalData?: any): Promise<NodeExecutionResult>;
  
  serialize?(node: any): any;
  
  deserialize?(data: any): any;
}
