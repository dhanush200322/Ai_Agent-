import { WorkflowNodeInterface, NodeExecutionResult } from '../providers/workflow-node.interface';
import { WorkflowExecutionContext } from '../engine/context.engine';

export class NodeRegistry {
  private nodes = new Map<string, WorkflowNodeInterface>();

  register(node: WorkflowNodeInterface) {
    this.nodes.set(node.type, node);
    console.log(`[NodeRegistry] Registered node type: ${node.type}`);
  }

  lookup(type: string): WorkflowNodeInterface {
    const node = this.nodes.get(type);
    if (!node) {
      throw new Error(`Node type '${type}' is not registered in the NodeRegistry.`);
    }
    return node;
  }

  resolve(type: string): WorkflowNodeInterface {
    return this.lookup(type);
  }

  async execute(type: string, node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const executor = this.lookup(type);
    
    // Call validation before execution
    const errors = executor.validate(node);
    if (errors && errors.length > 0) {
      return {
        status: 'FAILED',
        error: `Validation failed: ${errors.join(', ')}`
      };
    }
    
    return executor.execute(node, context);
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.nodes.keys());
  }
}

export const globalNodeRegistry = new NodeRegistry();
