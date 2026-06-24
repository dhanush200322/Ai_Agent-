import { prisma } from '../prisma';
import { globalNodeRegistry } from '../nodes/registry';
import { WorkflowExecutionContext } from './context.engine';
import { WorkflowNodeData } from '../types';

export class RollbackEngine {
  
  /**
   * Performs reverse compensation rollback on failed executions.
   */
  async rollbackExecution(context: WorkflowExecutionContext): Promise<void> {
    const executionId = context.execution.id;
    console.log(`[RollbackEngine] Starting compensation flow for execution: ${executionId}`);

    // Retrieve successfully completed node steps in reverse order (newest first)
    const completedSteps = await prisma.workflowExecutionStep.findMany({
      where: {
        executionId,
        status: 'COMPLETED'
      },
      orderBy: {
        finishedAt: 'desc'
      }
    });

    for (const step of completedSteps) {
      // Find the node definition
      const nodeDef = context.definition.nodes.find(n => n.id === step.nodeId);
      if (!nodeDef) continue;

      try {
        const executor = globalNodeRegistry.resolve(nodeDef.type);
        if (executor.rollback) {
          console.log(`[RollbackEngine] Running compensation for node: ${nodeDef.id} (${nodeDef.type})`);
          await executor.rollback(nodeDef, context);
        }
      } catch (err: any) {
        console.error(`[RollbackEngine] Compensation failed for node ${nodeDef.id}:`, err.message);
        // Continue rollbacks of previous nodes even if one rollback fails
      }
    }
    console.log(`[RollbackEngine] Compensation flow complete for execution: ${executionId}`);
  }
}
