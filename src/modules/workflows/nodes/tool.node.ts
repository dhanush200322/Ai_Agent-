import { BaseWorkflowNode } from './base.node';
import { WorkflowNodeData, NodeExecutionResult } from '../types/workflow.types';
import { WorkflowExecutionContext } from '../engine/context';

export class ToolNode implements BaseWorkflowNode {
  type = 'tool';

  async execute(node: WorkflowNodeData, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const toolName = node.config?.toolName;
    const argsTemplate = node.config?.args || {};

    if (!toolName) {
      return { status: 'FAILED', error: 'Missing toolName' };
    }
    if (!context.agent) {
      return { status: 'FAILED', error: 'No Agent attached to execute tool' };
    }

    try {
      // Resolve tool arguments (resolve objects dynamically via VariableManager)
      const resolvedArgs = context.variables.resolveObject(argsTemplate);

      // Resolve and Execute using Phase 6.6 infrastructure!
      const resolvedTool = await context.toolResolver.resolveTool(context.agent.id, toolName);
      
      const result = await context.toolExecutor.executeTool({
        tool: resolvedTool,
        args: resolvedArgs,
        organizationId: context.organization.id,
        agentId: context.agent.id,
        userId: context.execution.startedAt.toISOString(), // Placeholder, typically grabbed from triggering user
        conversationId: context.execution.id // Treat the workflow execution as the conversation session for tool tracking
      });

      // If it's a timeout/error returned as string (Phase 6.6 behavior)
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

  validate(node: WorkflowNodeData) {
    if (!node.config?.toolName) return ['Missing toolName'];
    return null;
  }
}
