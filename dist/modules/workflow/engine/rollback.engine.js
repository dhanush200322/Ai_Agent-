"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollbackEngine = void 0;
const prisma_1 = require("../prisma");
const registry_1 = require("../nodes/registry");
class RollbackEngine {
    /**
     * Performs reverse compensation rollback on failed executions.
     */
    async rollbackExecution(context) {
        const executionId = context.execution.id;
        console.log(`[RollbackEngine] Starting compensation flow for execution: ${executionId}`);
        // Retrieve successfully completed node steps in reverse order (newest first)
        const completedSteps = await prisma_1.prisma.workflowExecutionStep.findMany({
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
            if (!nodeDef)
                continue;
            try {
                const executor = registry_1.globalNodeRegistry.resolve(nodeDef.type);
                if (executor.rollback) {
                    console.log(`[RollbackEngine] Running compensation for node: ${nodeDef.id} (${nodeDef.type})`);
                    await executor.rollback(nodeDef, context);
                }
            }
            catch (err) {
                console.error(`[RollbackEngine] Compensation failed for node ${nodeDef.id}:`, err.message);
                // Continue rollbacks of previous nodes even if one rollback fails
            }
        }
        console.log(`[RollbackEngine] Compensation flow complete for execution: ${executionId}`);
    }
}
exports.RollbackEngine = RollbackEngine;
