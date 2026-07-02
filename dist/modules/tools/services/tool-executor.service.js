"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolExecutorService = void 0;
const prisma_1 = require("../../../shared/prisma");
const internal_executor_1 = require("../executors/internal.executor");
const external_executor_1 = require("../executors/external.executor");
const auditLogger_1 = require("../../../shared/audit/auditLogger");
class ToolExecutorService {
    executors = {
        'InternalExecutor': new internal_executor_1.InternalExecutor(),
        'HttpExecutor': new external_executor_1.HttpExecutor(),
        'WebhookExecutor': new external_executor_1.WebhookExecutor(),
        'FunctionExecutor': new external_executor_1.FunctionExecutor(),
    };
    async executeTool(params) {
        const { tool, args, organizationId, agentId, userId, conversationId } = params;
        // 1. Create ToolExecution record
        // Since internal tools might not have an actual 'Tool' DB record id, we can link if available, 
        // or just store the name in input if toolId is missing.
        // For this implementation, we will log the execution if it has an ID, otherwise generic log.
        let executionRecordId = null;
        let actualToolId = null;
        if (tool.category !== 'INTERNAL') {
            const dbTool = await prisma_1.prisma.tool.findFirst({
                where: { name: tool.name, organizationId }
            });
            actualToolId = dbTool?.id || null;
        }
        if (actualToolId) {
            const exec = await prisma_1.prisma.toolExecution.create({
                data: {
                    toolId: actualToolId,
                    conversationId,
                    agentId,
                    status: 'RUNNING',
                    input: JSON.stringify(args)
                }
            });
            executionRecordId = exec.id;
        }
        const startTime = Date.now();
        let result = '';
        let errorStr = '';
        try {
            const executor = this.executors[tool.executorName];
            if (!executor)
                throw new Error(`Executor ${tool.executorName} not found.`);
            const context = {
                tool,
                args,
                organizationId,
                agentId,
                userId,
                conversationId
            };
            result = await executor.execute(context);
        }
        catch (error) {
            errorStr = error.message;
        }
        const duration = Date.now() - startTime;
        // 2. Update ToolExecution record
        if (executionRecordId) {
            await prisma_1.prisma.toolExecution.update({
                where: { id: executionRecordId },
                data: {
                    status: errorStr ? 'FAILED' : 'COMPLETED',
                    output: errorStr ? null : String(result),
                    error: errorStr ? String(errorStr) : null,
                    duration,
                    finishedAt: new Date()
                }
            });
        }
        auditLogger_1.AuditLogger.log('TOOL_EXECUTED', 'tool', {
            toolName: tool.name,
            organizationId,
            agentId,
            status: errorStr ? 'FAILED' : 'COMPLETED',
            duration
        });
        if (errorStr) {
            return `Tool execution failed: ${errorStr}`;
        }
        return String(result);
    }
}
exports.ToolExecutorService = ToolExecutorService;
