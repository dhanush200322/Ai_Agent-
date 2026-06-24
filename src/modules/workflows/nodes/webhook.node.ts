import { BaseWorkflowNode } from './base.node';
import { WorkflowNodeData, NodeExecutionResult } from '../types/workflow.types';
import { WorkflowExecutionContext } from '../engine/context';

export class WebhookNode implements BaseWorkflowNode {
  type = 'webhook';

  async execute(node: WorkflowNodeData, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const url = context.variables.resolveString(node.config?.url);
    const method = node.config?.method || 'POST';
    const bodyTemplate = node.config?.body || {};
    const headers = node.config?.headers || {};

    if (!url) return { status: 'FAILED', error: 'Missing webhook URL' };

    try {
      const resolvedBody = context.variables.resolveObject(bodyTemplate);

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

  validate(node: WorkflowNodeData) {
    if (!node.config?.url) return ['Missing URL'];
    return null;
  }
}
