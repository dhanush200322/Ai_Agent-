import { WorkflowNodeInterface, NodeExecutionResult } from '../providers/workflow-node.interface';
import { WorkflowExecutionContext } from '../engine/context.engine';

export class LoopNode implements WorkflowNodeInterface {
  type = 'loop';

  async execute(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const listPath = node.config?.listVariable;
    if (!listPath) return { status: 'FAILED', error: 'Missing listVariable' };

    try {
      const listStr = await context.variables.resolveString(`{{${listPath}}}`);
      let parsedList: any[];
      try {
        parsedList = typeof listStr === 'string' ? JSON.parse(listStr) : listStr;
      } catch {
        parsedList = [];
      }

      if (!Array.isArray(parsedList)) {
        return { status: 'FAILED', error: 'listVariable is not an array' };
      }

      const currentIndex = context.variables.getScope().execution[`${node.id}_index`] || 0;

      if (currentIndex < parsedList.length) {
        const itemVarName = node.config?.itemVariable || 'currentItem';
        context.variables.setExecutionVariable(itemVarName, parsedList[currentIndex]);
        context.variables.setExecutionVariable(`${node.id}_index`, currentIndex + 1);

        return {
          status: 'COMPLETED',
          nextNodes: [node.config?.loopNodeId],
          output: { item: parsedList[currentIndex], index: currentIndex }
        };
      } else {
        context.variables.setExecutionVariable(`${node.id}_index`, 0);
        return {
          status: 'COMPLETED',
          nextNodes: [node.config?.doneNodeId],
          output: { done: true }
        };
      }
    } catch (e: any) {
      return { status: 'FAILED', error: e.message };
    }
  }

  validate(node: any) {
    if (!node.config?.listVariable) return ['Missing listVariable'];
    return null;
  }
}

export class DelayNode implements WorkflowNodeInterface {
  type = 'delay';

  async execute(node: any, _context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const delayMs = parseInt(node.config?.delayMs || '0', 10);
    
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    return { status: 'COMPLETED', output: { delayMs } };
  }

  validate() {
    return null;
  }
}
