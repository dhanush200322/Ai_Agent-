import { WorkflowNodeData, NodeExecutionResult } from '../types/workflow.types';
import { WorkflowExecutionContext } from '../engine/context';

export interface BaseWorkflowNode {
  type: string;
  
  execute(node: WorkflowNodeData, context: WorkflowExecutionContext): Promise<NodeExecutionResult>;
  
  validate(node: WorkflowNodeData): string[] | null; // returns array of errors or null if valid
  
  rollback?(node: WorkflowNodeData, context: WorkflowExecutionContext): Promise<void>;
  
  resume?(node: WorkflowNodeData, context: WorkflowExecutionContext, approvalData?: any): Promise<NodeExecutionResult>;
}
