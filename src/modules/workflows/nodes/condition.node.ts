import { BaseWorkflowNode } from './base.node';
import { WorkflowNodeData, NodeExecutionResult } from '../types/workflow.types';
import { WorkflowExecutionContext } from '../engine/context';

export class ConditionNode implements BaseWorkflowNode {
  type = 'condition';

  async execute(node: WorkflowNodeData, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const conditionExpression = node.config?.expression;
    if (!conditionExpression) {
      return { status: 'FAILED', error: 'Missing condition expression' };
    }

    try {
      // Resolve variables in the expression
      const resolvedExpression = context.variables.resolveString(conditionExpression);
      
      // EXTREMELY basic JS evaluation for the condition. 
      // In production, use a safe sandboxed evaluator (like we did in FunctionToolExecutor).
      const result = !!eval(resolvedExpression);
      
      // Determine next node based on true/false branch
      const trueNodeId = node.config.trueNodeId;
      const falseNodeId = node.config.falseNodeId;
      
      const nextNodes = [];
      if (result && trueNodeId) nextNodes.push(trueNodeId);
      if (!result && falseNodeId) nextNodes.push(falseNodeId);

      return {
        status: 'COMPLETED',
        output: { result, evaluated: resolvedExpression },
        nextNodes
      };

    } catch (e: any) {
      return { status: 'FAILED', error: e.message };
    }
  }

  validate(node: WorkflowNodeData) {
    if (!node.config?.expression) return ['Missing condition expression'];
    return null;
  }
}
