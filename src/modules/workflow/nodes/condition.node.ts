import { WorkflowNodeInterface, NodeExecutionResult } from '../providers/workflow-node.interface';
import { WorkflowExecutionContext } from '../engine/context.engine';

export class ConditionNode implements WorkflowNodeInterface {
  type = 'condition';

  async execute(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const conditionExpression = node.config?.expression;
    if (!conditionExpression) {
      return { status: 'FAILED', error: 'Missing condition expression' };
    }

    try {
      // Resolve variables in expression
      const resolvedExpression = await context.variables.resolveString(conditionExpression);
      
      // Basic JS evaluation in sandbox simulation
      let result = false;
      try {
        result = !!eval(resolvedExpression);
      } catch (e: any) {
        return { status: 'FAILED', error: `Condition evaluation error: ${e.message}` };
      }
      
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

  validate(node: any) {
    if (!node.config?.expression) return ['Missing condition expression'];
    return null;
  }
}
