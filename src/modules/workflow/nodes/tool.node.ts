import { WorkflowNodeInterface, NodeExecutionResult } from '../providers/workflow-node.interface';
import { WorkflowExecutionContext } from '../engine/context.engine';

export class ToolNode implements WorkflowNodeInterface {
  type = 'tool';

  async execute(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const toolName = node.config?.toolName;
    const argsTemplate = node.config?.args || {};

    if (!toolName) {
      return { status: 'FAILED', error: 'Missing toolName' };
    }
    if (!context.agent) {
      return { status: 'FAILED', error: 'No Agent attached to execute tool' };
    }

    try {
      // Resolve tool arguments dynamically
      const resolvedArgs = await context.variables.resolveObject(argsTemplate);

      // Resolve and execute using tools module
      const resolvedTool = await context.toolResolver.resolveTool(context.agent.id, toolName);
      
      const result = await context.toolExecutor.executeTool({
        tool: resolvedTool,
        args: resolvedArgs,
        organizationId: context.organization.id,
        agentId: context.agent.id,
        userId: 'SYSTEM',
        conversationId: context.execution.id
      });

      if (typeof result === 'string' && result.startsWith('error')) {
        return { status: 'FAILED', error: result };
      }

      return {
        status: 'COMPLETED',
        output: { result }
      };

    } catch (e: any) {
      return { status: 'FAILED', error: e.message };
    }
  }

  validate(node: any) {
    if (!node.config?.toolName) return ['Missing toolName'];
    return null;
  }
}
