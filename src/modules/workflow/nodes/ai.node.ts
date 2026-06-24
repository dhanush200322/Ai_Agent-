import { WorkflowNodeInterface, NodeExecutionResult } from '../providers/workflow-node.interface';
import { WorkflowExecutionContext } from '../engine/context.engine';

export class AiNode implements WorkflowNodeInterface {
  type = 'ai';

  async execute(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const promptTemplate = node.config?.prompt;
    if (!promptTemplate) {
      return { status: 'FAILED', error: 'Missing prompt' };
    }

    try {
      // Resolve prompt template
      const resolvedPrompt = await context.variables.resolveString(promptTemplate);

      // Use agent configuration if attached
      const model = context.agent?.model || 'llama-3.1-8b-instant';
      const temperature = context.agent?.temperature !== undefined ? context.agent.temperature : 0.7;

      // Call LLM
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

  validate(node: any) {
    if (!node.config?.prompt) return ['Missing prompt'];
    return null;
  }
}
