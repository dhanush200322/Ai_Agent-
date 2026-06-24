import { BaseWorkflowNode } from './base.node';
import { WorkflowNodeData, NodeExecutionResult } from '../types/workflow.types';
import { WorkflowExecutionContext } from '../engine/context';

export class AiNode implements BaseWorkflowNode {
  type = 'ai';

  async execute(node: WorkflowNodeData, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const promptTemplate = node.config?.prompt;
    if (!promptTemplate) {
      return { status: 'FAILED', error: 'Missing prompt' };
    }

    try {
      // Resolve prompt template
      const resolvedPrompt = context.variables.resolveString(promptTemplate);

      // We use the agent assigned to the workflow.
      const model = context.agent?.model || 'llama-3.1-8b-instant';
      const temperature = context.agent?.temperature || 0.7;

      // Ask LLM (simulating a direct Groq service call)
      const response = await context.llm.generateChatCompletion(
        [{ role: 'user', content: resolvedPrompt }],
        { model, temperature }
      );

      return {
        status: 'COMPLETED',
        output: { result: response.content }
      };

    } catch (e: any) {
      return { status: 'FAILED', error: e.message };
    }
  }

  validate(node: WorkflowNodeData) {
    if (!node.config?.prompt) return ['Missing prompt'];
    return null;
  }
}
