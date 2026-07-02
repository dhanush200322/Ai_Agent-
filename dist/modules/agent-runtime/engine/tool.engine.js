"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
class ToolEngine {
    async executeTool(executionId, toolId, input, overrideConversationId) {
        const execution = await prisma_1.prisma.agentExecution.findUnique({
            where: { id: executionId },
            include: { agent: true, session: true }
        });
        if (!execution)
            throw new Error('Execution not found');
        const conversationId = overrideConversationId || execution.session?.id || executionId; // Mock conversationId for ToolExecution
        const toolExecution = await prisma_1.prisma.toolExecution.create({
            data: {
                conversationId,
                agentId: execution.agentId,
                toolId,
                status: 'RUNNING',
                input: JSON.stringify(input)
            }
        });
        try {
            // Mock actual tool execution call
            const output = JSON.stringify({ success: true, executedAt: new Date() });
            await prisma_1.prisma.toolExecution.update({
                where: { id: toolExecution.id },
                data: {
                    status: 'COMPLETED',
                    output,
                    finishedAt: new Date(),
                    duration: 200
                }
            });
            return JSON.parse(output);
        }
        catch (error) {
            await prisma_1.prisma.toolExecution.update({
                where: { id: toolExecution.id },
                data: {
                    status: 'FAILED',
                    error: error.message,
                    finishedAt: new Date()
                }
            });
            throw error;
        }
    }
    async discoverTools(agentId) {
        const agentTools = await prisma_1.prisma.agentTool.findMany({
            where: { agentId, enabled: true },
            include: { tool: true }
        });
        return agentTools.map(at => at.tool);
    }
}
exports.ToolEngine = ToolEngine;
