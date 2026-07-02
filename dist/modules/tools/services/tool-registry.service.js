"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistryService = void 0;
const prisma_1 = require("../../../shared/prisma");
const AppError_1 = require("../../../shared/errors/AppError");
const auditLogger_1 = require("../../../shared/audit/auditLogger");
class ToolRegistryService {
    /**
     * Registers a new global or organizational tool
     */
    async registerTool(data) {
        const tool = await prisma_1.prisma.tool.create({
            data: {
                ...data,
            }
        });
        auditLogger_1.AuditLogger.log('TOOL_REGISTERED', 'tool', { toolId: tool.id, organizationId: data.organizationId });
        return tool;
    }
    /**
     * Fetches a specific tool
     */
    async getTool(organizationId, toolId) {
        const tool = await prisma_1.prisma.tool.findFirst({
            where: { id: toolId, organizationId, deletedAt: null }
        });
        if (!tool)
            throw new AppError_1.NotFoundError('Tool not found');
        return tool;
    }
    /**
     * Lists all tools available to an organization
     */
    async listOrganizationTools(organizationId) {
        return prisma_1.prisma.tool.findMany({
            where: { organizationId, deletedAt: null }
        });
    }
    /**
     * Assigns a tool to an agent
     */
    async assignToolToAgent(agentId, toolId, configuration) {
        return prisma_1.prisma.agentTool.upsert({
            where: {
                agentId_toolId: { agentId, toolId }
            },
            update: {
                enabled: true,
                configuration,
                priority: 0
            },
            create: {
                agentId,
                toolId,
                configuration,
                enabled: true,
                priority: 0
            }
        });
    }
    /**
     * Retrieves all enabled tools for a specific agent
     */
    async getAgentTools(agentId) {
        const agentTools = await prisma_1.prisma.agentTool.findMany({
            where: {
                agentId,
                enabled: true,
                tool: {
                    enabled: true,
                    deletedAt: null
                }
            },
            include: {
                tool: true
            },
            orderBy: {
                priority: 'desc'
            }
        });
        return agentTools;
    }
    /**
     * Enables or disables a tool system-wide
     */
    async setToolStatus(organizationId, toolId, enabled) {
        const tool = await this.getTool(organizationId, toolId);
        return prisma_1.prisma.tool.update({
            where: { id: tool.id },
            data: { enabled }
        });
    }
    /**
     * Soft deletes a tool
     */
    async deleteTool(organizationId, toolId) {
        const tool = await this.getTool(organizationId, toolId);
        await prisma_1.prisma.tool.update({
            where: { id: tool.id },
            data: { deletedAt: new Date(), enabled: false }
        });
        auditLogger_1.AuditLogger.log('TOOL_DELETED', 'tool', { toolId: tool.id, organizationId });
        return { success: true };
    }
}
exports.ToolRegistryService = ToolRegistryService;
