import { BaseWorkflowNode } from './base.node';

export class NodeRegistry {
  private nodes = new Map<string, BaseWorkflowNode>();

  register(node: BaseWorkflowNode) {
    this.nodes.set(node.type, node);
  }

  resolve(type: string): BaseWorkflowNode {
    const node = this.nodes.get(type);
    if (!node) {
      throw new Error(`Node type ${type} is not registered in the NodeRegistry`);
    }
    return node;
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.nodes.keys());
  }
}

export const globalNodeRegistry = new NodeRegistry();
