import { globalNodeRegistry } from './registry';
import { AiNode } from './ai.node';
import { ToolNode } from './tool.node';
import { WebhookNode } from './webhook.node';
import { ApprovalNode } from './approval.node';
import { ConditionNode } from './condition.node';
import { LoopNode, DelayNode } from './misc.nodes';

export function initializeNodeRegistry() {
  globalNodeRegistry.register(new AiNode());
  globalNodeRegistry.register(new ToolNode());
  globalNodeRegistry.register(new WebhookNode());
  globalNodeRegistry.register(new ApprovalNode());
  globalNodeRegistry.register(new ConditionNode());
  globalNodeRegistry.register(new LoopNode());
  globalNodeRegistry.register(new DelayNode());
  
  // A generic mock trigger node for tests
  globalNodeRegistry.register({
    type: 'trigger',
    execute: async (_node, _ctx) => ({ status: 'COMPLETED', output: { success: true } }),
    validate: () => null
  });
}
export { globalNodeRegistry };
