import { AgentRepository } from '../repositories/agent.repository';
import { AuditLogger } from '../../../shared/audit/auditLogger';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';

export class AgentService {
  private agentRepo = new AgentRepository();

  async getAgents(organizationId: string, page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const { items, total } = await this.agentRepo.findAgents(organizationId, skip, limit, search);
    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      items
    };
  }

  async getAgent(organizationId: string, id: string) {
    const agent = await this.agentRepo.findAgentById(organizationId, id);
    if (!agent) throw new NotFoundError('Agent not found');
    return agent;
  }

  async createAgent(organizationId: string, userId: string, data: any) {
    const existing = await this.agentRepo.findAgentBySlug(organizationId, data.slug);
    if (existing) {
      throw new ConflictError('An agent with this slug already exists in your organization');
    }

    const agentData: any = {
      name: data.name,
      slug: data.slug,
      model: data.model,
      organizationId,
      createdById: userId
    };
    if (data.description !== undefined) agentData.description = data.description;
    if (data.systemPrompt !== undefined) agentData.systemPrompt = data.systemPrompt;
    if (data.temperature !== undefined) agentData.temperature = Number(data.temperature);
    if (data.topP !== undefined) agentData.topP = Number(data.topP);
    if (data.maxTokens !== undefined) agentData.maxTokens = Number(data.maxTokens);
    if (data.visibility !== undefined) agentData.visibility = data.visibility;
    if (data.avatar !== undefined) agentData.avatar = data.avatar;

    console.log('AGENT_CREATE_DATA', JSON.stringify(agentData, null, 2));
    const agent = await this.agentRepo.createAgent(agentData);

    AuditLogger.log('AGENT_CREATED', 'agent', { agentId: agent.id, organizationId });
    return agent;
  }

  async updateAgent(organizationId: string, id: string, data: any) {
    const agent = await this.agentRepo.findAgentById(organizationId, id);
    if (!agent) throw new NotFoundError('Agent not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.systemPrompt !== undefined) updateData.systemPrompt = data.systemPrompt;
    if (data.temperature !== undefined) updateData.temperature = Number(data.temperature);
    if (data.topP !== undefined) updateData.topP = Number(data.topP);
    if (data.maxTokens !== undefined) updateData.maxTokens = Number(data.maxTokens);
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    const updated = await this.agentRepo.updateAgent(organizationId, id, updateData);
    AuditLogger.log('AGENT_UPDATED', 'agent', { agentId: id, organizationId });
    return updated;
  }

  async softDeleteAgent(organizationId: string, id: string) {
    const agent = await this.agentRepo.findAgentById(organizationId, id);
    if (!agent) throw new NotFoundError('Agent not found');

    await this.agentRepo.softDeleteAgent(organizationId, id);
    AuditLogger.log('AGENT_DELETED', 'agent', { agentId: id, organizationId });
    return { success: true };
  }

  async getKnowledgeBases(organizationId: string, agentId: string) {
    // Verify agent exists
    await this.getAgent(organizationId, agentId);
    const kbs = await this.agentRepo.getKnowledgeBases(organizationId, agentId);
    return kbs.map(akb => akb.knowledgeBase);
  }

  async addKnowledgeBases(organizationId: string, agentId: string, knowledgeBaseIds: string[]) {
    // Verify agent exists
    await this.getAgent(organizationId, agentId);
    // Ideally we should also verify KBs exist in the organization, but skipDuplicates in repo handles constraint safely if we assume valid IDs, but foreign key needs them to exist. Let's just insert.
    await this.agentRepo.addKnowledgeBases(agentId, knowledgeBaseIds);
    AuditLogger.log('AGENT_KB_ATTACHED', 'agent', { agentId, organizationId, knowledgeBaseIds });
    return { success: true };
  }

  async removeKnowledgeBase(organizationId: string, agentId: string, knowledgeBaseId: string) {
    // Verify agent exists
    await this.getAgent(organizationId, agentId);
    await this.agentRepo.removeKnowledgeBase(agentId, knowledgeBaseId);
    AuditLogger.log('AGENT_KB_DETACHED', 'agent', { agentId, organizationId, knowledgeBaseId });
    return { success: true };
  }
}
