"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionEngine = void 0;
const prisma_1 = require("../prisma");
const registry_1 = require("../nodes/registry");
const rollback_engine_1 = require("./rollback.engine");
const metering_engine_1 = require("../../billing/engine/metering.engine");
const notification_engine_1 = require("../../notification/engine/notification.engine");
const rollbackEngine = new rollback_engine_1.RollbackEngine();
const meteringEngine = new metering_engine_1.MeteringEngine();
const notificationEngine = new notification_engine_1.NotificationEngine();
class ExecutionEngine {
    async run(context, startNodeId) {
        const { nodes, edges } = context.definition;
        const executionId = context.execution.id;
        const orgId = context.organization.id;
        console.log(`[ExecutionEngine] Starting execution ${executionId} (startNodeId: ${startNodeId || 'none'})`);
        // 1. Record Workflow Started usage event
        if (!startNodeId) {
            await prisma_1.prisma.workflowExecution.update({
                where: { id: executionId },
                data: { status: 'RUNNING' }
            });
            await meteringEngine.recordUsageEvent(orgId, 'WORKFLOW_STARTED', 1);
        }
        // Find trigger node or explicitly requested start node
        const triggerNodes = nodes.filter(n => n.type === 'trigger');
        let currentNodes = startNodeId ? [nodes.find(n => n.id === startNodeId)] : triggerNodes;
        if (currentNodes.length === 0 && nodes.length > 0 && !startNodeId) {
            currentNodes = [nodes[0]]; // fallback
        }
        // Graph nodes stack (could run in parallel)
        const queue = [...currentNodes];
        while (queue.length > 0) {
            const node = queue.shift();
            const startTime = Date.now();
            let nodeStartTime = startTime;
            console.log(`[ExecutionEngine] Running node ${node.id} (${node.type})`);
            // Create step log and execution log
            const log = await prisma_1.prisma.workflowExecutionLog.create({
                data: {
                    executionId,
                    nodeId: node.id,
                    nodeType: node.type,
                    status: 'RUNNING',
                    input: JSON.stringify(node.config)
                }
            });
            const step = await prisma_1.prisma.workflowExecutionStep.create({
                data: {
                    executionId,
                    nodeId: node.id,
                    nodeType: node.type,
                    status: 'RUNNING',
                    input: JSON.stringify(node.config)
                }
            });
            try {
                let result = null;
                let attempts = 0;
                const maxAttempts = (node.config?.retryLimit || 0) + 1;
                const delay = node.config?.retryDelayMs || 0;
                const timeoutMs = node.config?.timeoutMs || 0;
                // Record Node Execution usage
                await meteringEngine.recordUsageEvent(orgId, 'NODE_EXECUTIONS', 1);
                if (node.type === 'ai') {
                    await meteringEngine.recordUsageEvent(orgId, 'AI_CALLS', 1);
                }
                else if (node.type === 'webhook' || node.type === 'tool') {
                    await meteringEngine.recordUsageEvent(orgId, 'EXTERNAL_API_CALLS', 1);
                }
                nodeStartTime = Date.now();
                while (attempts < maxAttempts) {
                    try {
                        attempts++;
                        if (timeoutMs > 0) {
                            result = await Promise.race([
                                registry_1.globalNodeRegistry.execute(node.type, node, context),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs))
                            ]);
                        }
                        else {
                            result = await registry_1.globalNodeRegistry.execute(node.type, node, context);
                        }
                        if (result && result.status === 'FAILED') {
                            throw new Error(result.error || 'Node execution failed.');
                        }
                        break; // Success! Break retry loop.
                    }
                    catch (e) {
                        if (attempts >= maxAttempts) {
                            throw e; // Exceeded attempts
                        }
                        if (delay > 0) {
                            await new Promise(r => setTimeout(r, delay));
                        }
                    }
                }
                const duration = Date.now() - nodeStartTime;
                // Save node output to scope
                if (result.output) {
                    context.variables.setNodeOutput(node.id, result.output);
                }
                // Save execution state in database
                const stateStr = JSON.stringify(context.variables.getScopeWithoutSecrets());
                await prisma_1.prisma.workflowExecution.update({
                    where: { id: executionId },
                    data: { state: stateStr }
                });
                // Handle PAUSED status (e.g. approval nodes)
                if (result.status === 'PAUSED') {
                    await this.finishStep(log.id, step.id, 'PAUSED', result.output, duration);
                    await prisma_1.prisma.workflowExecution.update({
                        where: { id: executionId },
                        data: { status: 'PAUSED' }
                    });
                    return; // Exit execution runner immediately, wait for resume
                }
                if (result.status === 'FAILED') {
                    throw new Error(result.error || 'Node execution failed.');
                }
                await this.finishStep(log.id, step.id, 'COMPLETED', result.output, duration);
                // Find next nodes based on edges and branches
                let nextEdges = edges.filter(e => e.source === node.id);
                if (result.nextNodes && result.nextNodes.length > 0) {
                    nextEdges = nextEdges.filter(e => result.nextNodes.includes(e.target));
                }
                for (const edge of nextEdges) {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (targetNode && !queue.some(q => q.id === targetNode.id)) {
                        queue.push(targetNode);
                    }
                }
            }
            catch (error) {
                console.error(`[ExecutionEngine] Node ${node.id} (${node.type}) failed: ${error.message}`, error.stack);
                const duration = Date.now() - nodeStartTime;
                await this.finishStep(log.id, step.id, 'FAILED', null, duration, error.message);
                // Mark execution as failed
                await prisma_1.prisma.workflowExecution.update({
                    where: { id: executionId },
                    data: { status: 'FAILED', error: error.message, finishedAt: new Date() }
                });
                await meteringEngine.recordUsageEvent(orgId, 'WORKFLOW_FAILED', 1);
                // Trigger failure notification
                try {
                    await notificationEngine.trigger({
                        organizationId: orgId,
                        recipient: 'admin@test.com',
                        channel: 'EMAIL',
                        subject: 'Workflow Execution Failed',
                        body: `Workflow execution ${executionId} failed. Error: ${error.message}`
                    });
                }
                catch (e) {
                    console.warn('[ExecutionEngine] Failed to trigger error notification:', e);
                }
                // Trigger compensation rollback
                await rollbackEngine.rollbackExecution(context);
                return; // Halt workflow execution
            }
        }
        // Success completion
        await prisma_1.prisma.workflowExecution.update({
            where: { id: executionId },
            data: { status: 'COMPLETED', finishedAt: new Date() }
        });
        await meteringEngine.recordUsageEvent(orgId, 'WORKFLOW_COMPLETED', 1);
        // Trigger success notification
        try {
            await notificationEngine.trigger({
                organizationId: orgId,
                recipient: 'admin@test.com',
                channel: 'EMAIL',
                subject: 'Workflow Execution Completed',
                body: `Workflow execution ${executionId} completed successfully.`
            });
        }
        catch (e) {
            console.warn('[ExecutionEngine] Failed to trigger success notification:', e);
        }
    }
    async resume(context, nodeId, approvalData) {
        const node = context.definition.nodes.find(n => n.id === nodeId);
        if (!node)
            throw new Error(`Node ${nodeId} not found to resume.`);
        const executionId = context.execution.id;
        const orgId = context.organization.id;
        const startTime = Date.now();
        await prisma_1.prisma.workflowExecution.update({
            where: { id: executionId },
            data: { status: 'RUNNING' }
        });
        const log = await prisma_1.prisma.workflowExecutionLog.create({
            data: {
                executionId,
                nodeId: node.id,
                nodeType: node.type,
                status: 'RUNNING',
                input: JSON.stringify({ resume: true, approvalData })
            }
        });
        const step = await prisma_1.prisma.workflowExecutionStep.create({
            data: {
                executionId,
                nodeId: node.id,
                nodeType: node.type,
                status: 'RUNNING',
                input: JSON.stringify({ resume: true, approvalData })
            }
        });
        try {
            const executor = registry_1.globalNodeRegistry.resolve(node.type);
            let result;
            if (approvalData?.retry) {
                const executionVars = context.variables.getScopeWithoutSecrets().execution || {};
                const retryNode = { ...node, config: { ...node.config, ...executionVars } };
                result = await executor.execute(retryNode, context);
            }
            else {
                if (!executor.resume)
                    throw new Error(`Node type ${node.type} does not support resume.`);
                result = await executor.resume(node, context, approvalData);
            }
            const duration = Date.now() - startTime;
            if (result.output) {
                context.variables.setNodeOutput(node.id, result.output);
            }
            const stateStr = JSON.stringify(context.variables.getScopeWithoutSecrets());
            await prisma_1.prisma.workflowExecution.update({
                where: { id: executionId },
                data: { state: stateStr }
            });
            if (result.status === 'FAILED') {
                throw new Error(result.error || 'Node execution failed on resume.');
            }
            await this.finishStep(log.id, step.id, 'COMPLETED', result.output, duration);
            // Branch to next nodes
            let nextEdges = context.definition.edges.filter(e => e.source === node.id);
            if (result.nextNodes && result.nextNodes.length > 0) {
                nextEdges = nextEdges.filter(e => result.nextNodes.includes(e.target));
            }
            if (nextEdges.length === 0) {
                await prisma_1.prisma.workflowExecution.update({
                    where: { id: executionId },
                    data: { status: 'COMPLETED', finishedAt: new Date() }
                });
            }
            else {
                for (const edge of nextEdges) {
                    await this.run(context, edge.target);
                }
            }
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await this.finishStep(log.id, step.id, 'FAILED', null, duration, error.message);
            await prisma_1.prisma.workflowExecution.update({
                where: { id: executionId },
                data: { status: 'FAILED', error: error.message, finishedAt: new Date() }
            });
            await meteringEngine.recordUsageEvent(orgId, 'WORKFLOW_FAILED', 1);
            // Trigger rollback
            await rollbackEngine.rollbackExecution(context);
        }
    }
    async finishStep(logId, stepId, status, output, duration, error) {
        const data = {
            status,
            output: output ? JSON.stringify(output) : null,
            error: error || null,
            duration,
            finishedAt: new Date()
        };
        await prisma_1.prisma.workflowExecutionLog.update({
            where: { id: logId },
            data
        });
        await prisma_1.prisma.workflowExecutionStep.update({
            where: { id: stepId },
            data
        });
    }
}
exports.ExecutionEngine = ExecutionEngine;
