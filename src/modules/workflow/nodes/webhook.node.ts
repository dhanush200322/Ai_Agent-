import { WorkflowNodeInterface, NodeExecutionResult } from '../providers/workflow-node.interface';
import { WorkflowExecutionContext } from '../engine/context.engine';

export class WebhookNode implements WorkflowNodeInterface {
  type = 'webhook';

  async execute(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const url = await context.variables.resolveString(node.config?.url);
    const method = node.config?.method || 'POST';
    const bodyTemplate = node.config?.body || {};
    const headers = node.config?.headers || {};

    if (!url) return { status: 'FAILED', error: 'Missing webhook URL' };

    try {
      const resolvedBody = await context.variables.resolveObject(bodyTemplate);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: method !== 'GET' ? JSON.stringify(resolvedBody) : undefined
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        return { status: 'FAILED', error: `HTTP ${response.status}: ${responseText}` };
      }

      return {
        status: 'COMPLETED',
        output: { status: response.status, data: responseData }
      };
    } catch (e: any) {
      return { status: 'FAILED', error: e.message };
    }
  }

  validate(node: any) {
    if (!node.config?.url) return ['Missing URL'];
    return null;
  }
}
