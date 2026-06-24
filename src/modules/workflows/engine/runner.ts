import { WorkflowExecutionContext } from './context';
import { globalNodeRegistry } from '../nodes/registry';
import { StateManager } from './state-manager';
import { WorkflowNodeData } from '../types/workflow.types';

export class WorkflowRunner {
  private stateManager = new StateManager();

  async run(context: WorkflowExecutionContext, startNodeId?: string): Promise<void> {
    const { nodes, edges } = context.definition;
    await this.stateManager.setExecutionStatus(context.execution.id, 'RUNNING');
    
    // Find trigger node or explicitly requested start node
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    let currentNodes = startNodeId ? [nodes.find(n => n.id === startNodeId)!] : triggerNodes;

    if (currentNodes.length === 0 && nodes.length > 0 && !startNodeId) {
      currentNodes = [nodes[0]]; // fallback
    }

    const queue: WorkflowNodeData[] = [...currentNodes];

    while (queue.length > 0) {
      const node = queue.shift()!;
      
      const log = await this.stateManager.logNodeStart(context.execution.id, node.id, node.type, node.config);
      
      try {
        const executor = globalNodeRegistry.resolve(node.type);
        const result = await executor.execute(node, context);
        
        // Save state after node executes
        await this.stateManager.saveState(context);

        if (result.status === 'PAUSED') {
          await this.stateManager.logNodeFinish(log.id, 'PAUSED', result.output);
          await this.stateManager.setExecutionStatus(context.execution.id, 'PAUSED');
          return; // Exit runner immediately
        }

        await this.stateManager.logNodeFinish(log.id, result.status, result.output);

        if (result.status === 'FAILED') {
          await this.stateManager.setExecutionStatus(context.execution.id, 'FAILED');
          return; // Halts workflow on failure unless caught by a catch node
        }

        // Determine next nodes
        let nextEdges = edges.filter(e => e.source === node.id);
        if (result.nextNodes && result.nextNodes.length > 0) {
          nextEdges = nextEdges.filter(e => result.nextNodes!.includes(e.target));
        }

        for (const edge of nextEdges) {
          const targetNode = nodes.find(n => n.id === edge.target);
          if (targetNode) queue.push(targetNode);
        }

      } catch (error: any) {
        await this.stateManager.logNodeFinish(log.id, 'FAILED', null, error.message);
        await this.stateManager.setExecutionStatus(context.execution.id, 'FAILED');
        return;
      }
    }

    await this.stateManager.setExecutionStatus(context.execution.id, 'COMPLETED');
  }

  async resumeNode(context: WorkflowExecutionContext, nodeId: string, approvalData?: any): Promise<void> {
    const node = context.definition.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found to resume`);

    await this.stateManager.setExecutionStatus(context.execution.id, 'RUNNING');
    const log = await this.stateManager.logNodeStart(context.execution.id, node.id, node.type, { resume: true, approvalData });

    try {
      const executor = globalNodeRegistry.resolve(node.type);
      if (!executor.resume) throw new Error(`Node ${node.type} does not support resume`);

      const result = await executor.resume(node, context, approvalData);
      
      await this.stateManager.saveState(context);
      await this.stateManager.logNodeFinish(log.id, result.status, result.output);

      if (result.status === 'FAILED') {
        await this.stateManager.setExecutionStatus(context.execution.id, 'FAILED');
        return;
      }

      // Find next nodes
      let nextEdges = context.definition.edges.filter(e => e.source === node.id);
      if (result.nextNodes && result.nextNodes.length > 0) {
        nextEdges = nextEdges.filter(e => result.nextNodes!.includes(e.target));
      }

      if (nextEdges.length > 0) {
         // Queue next nodes and continue normal run loop by passing them into a new run
         // However, standard run expects startNodeId. We can just loop here or call run with the next node.
         for (const edge of nextEdges) {
           await this.run(context, edge.target);
           // NOTE: this could branch out parallel runs if we await sequentially. 
           // In a full async queue, we dispatch them. Here we just run sequentially.
         }
      } else {
        await this.stateManager.setExecutionStatus(context.execution.id, 'COMPLETED');
      }

    } catch (error: any) {
      await this.stateManager.logNodeFinish(log.id, 'FAILED', null, error.message);
      await this.stateManager.setExecutionStatus(context.execution.id, 'FAILED');
    }
  }
}
