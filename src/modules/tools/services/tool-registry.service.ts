import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../shared/errors/AppError';
import { AuditLogger } from '../../../shared/audit/auditLogger';

const prisma = new PrismaClient();

export class ToolRegistryService {
  /**
   * Registers a new global or organizational tool
   */
  async registerTool(data: {
    organizationId: string;
    name: string;
    displayName: string;
    description: string;
    category: string;
    enabled?: boolean;
    timeout?: number;
  }) {
    const tool = await prisma.tool.create({
      data: {
        ...data,
      }
    });

    AuditLogger.log('TOOL_REGISTERED', 'tool', { toolId: tool.id, organizationId: data.organizationId });
    return tool;
  }

  /**
   * Fetches a specific tool
   */
  async getTool(organizationId: string, toolId: string) {
    const tool = await prisma.tool.findFirst({
      where: { id: toolId, organizationId, deletedAt: null }
    });
    if (!tool) throw new NotFoundError('Tool not found');
    return tool;
  }

  /**
   * Lists all tools available to an organization
   */
  async listOrganizationTools(organizationId: string) {
    return prisma.tool.findMany({
      where: { organizationId, deletedAt: null }
    });
  }

  /**
   * Assigns a tool to an agent
   */
  async assignToolToAgent(agentId: string, toolId: string, configuration?: string) {
    return prisma.agentTool.upsert({
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
  async getAgentTools(agentId: string) {
    const agentTools = await prisma.agentTool.findMany({
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
  async setToolStatus(organizationId: string, toolId: string, enabled: boolean) {
    const tool = await this.getTool(organizationId, toolId);
    return prisma.tool.update({
      where: { id: tool.id },
      data: { enabled }
    });
  }

  /**
   * Soft deletes a tool
   */
  async deleteTool(organizationId: string, toolId: string) {
    const tool = await this.getTool(organizationId, toolId);
    await prisma.tool.update({
      where: { id: tool.id },
      data: { deletedAt: new Date(), enabled: false }
    });
    AuditLogger.log('TOOL_DELETED', 'tool', { toolId: tool.id, organizationId });
    return { success: true };
  }
}
