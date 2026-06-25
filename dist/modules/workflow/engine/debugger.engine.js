"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebuggerEngine = void 0;
const prisma_1 = require("../prisma");
const execution_service_1 = require("../services/execution.service");
class DebuggerEngine {
    /**
     * Retrieves step-by-step execution inputs, outputs, status, and variables state.
     */
    async inspectStep(executionId, nodeId) {
        const step = await prisma_1.prisma.workflowExecutionStep.findFirst({
            where: { executionId, nodeId },
            orderBy: { startedAt: 'desc' }
        });
        if (!step) {
            throw new Error(`No execution step found for node ${nodeId} in execution ${executionId}`);
        }
        return {
            stepId: step.id,
            nodeId: step.nodeId,
            nodeType: step.nodeType,
            status: step.status,
            input: step.input ? JSON.parse(step.input) : null,
            output: step.output ? JSON.parse(step.output) : null,
            error: step.error,
            duration: step.duration,
            startedAt: step.startedAt,
            finishedAt: step.finishedAt
        };
    }
    /**
     * Retries a specific failed step in the execution, optionally overriding input values.
     */
    async retryFailedStep(executionId, nodeId, modifiedInput) {
        const execution = await prisma_1.prisma.workflowExecution.findUnique({
            where: { id: executionId }
        });
        if (!execution)
            throw new Error('Execution not found');
        if (execution.status !== 'FAILED') {
            throw new Error(`Only failed executions can be retried. Current status is ${execution.status}`);
        }
        // Reset status of execution to RUNNING/PENDING
        await prisma_1.prisma.workflowExecution.update({
            where: { id: executionId },
            data: { status: 'PENDING', error: null }
        });
        // If modified inputs are provided, merge them into the saved state
        if (modifiedInput) {
            const stateObj = JSON.parse(execution.state || '{}');
            stateObj.execution = {
                ...stateObj.execution,
                ...modifiedInput
            };
            await prisma_1.prisma.workflowExecution.update({
                where: { id: executionId },
                data: { state: JSON.stringify(stateObj) }
            });
        }
        // Resume execution starting at the failed node
        const executionService = new execution_service_1.ExecutionService();
        await executionService.resumeExecution(executionId, nodeId, { retry: true });
    }
}
exports.DebuggerEngine = DebuggerEngine;
