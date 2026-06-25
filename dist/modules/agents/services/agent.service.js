"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const agent_repository_1 = require("../repositories/agent.repository");
const auditLogger_1 = require("../../../shared/audit/auditLogger");
const AppError_1 = require("../../../shared/errors/AppError");
class AgentService {
    agentRepo = new agent_repository_1.AgentRepository();
    async getAgents(organizationId, page, limit, search) {
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
    async getAgent(organizationId, id) {
        const agent = await this.agentRepo.findAgentById(organizationId, id);
        if (!agent)
            throw new AppError_1.NotFoundError('Agent not found');
        return agent;
    }
    async createAgent(organizationId, userId, data) {
        const existing = await this.agentRepo.findAgentBySlug(organizationId, data.slug);
        if (existing) {
            throw new AppError_1.ConflictError('An agent with this slug already exists in your organization');
        }
        const agentData = {
            name: data.name,
            slug: data.slug,
            model: data.model,
            organizationId,
            createdById: userId
        };
        if (data.description !== undefined)
            agentData.description = data.description;
        if (data.systemPrompt !== undefined)
            agentData.systemPrompt = data.systemPrompt;
        if (data.temperature !== undefined)
            agentData.temperature = Number(data.temperature);
        if (data.topP !== undefined)
            agentData.topP = Number(data.topP);
        if (data.maxTokens !== undefined)
            agentData.maxTokens = Number(data.maxTokens);
        if (data.visibility !== undefined)
            agentData.visibility = data.visibility;
        if (data.avatar !== undefined)
            agentData.avatar = data.avatar;
        console.log('AGENT_CREATE_DATA', JSON.stringify(agentData, null, 2));
        const agent = await this.agentRepo.createAgent(agentData);
        auditLogger_1.AuditLogger.log('AGENT_CREATED', 'agent', { agentId: agent.id, organizationId });
        return agent;
    }
    async updateAgent(organizationId, id, data) {
        const agent = await this.agentRepo.findAgentById(organizationId, id);
        if (!agent)
            throw new AppError_1.NotFoundError('Agent not found');
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.model !== undefined)
            updateData.model = data.model;
        if (data.systemPrompt !== undefined)
            updateData.systemPrompt = data.systemPrompt;
        if (data.temperature !== undefined)
            updateData.temperature = Number(data.temperature);
        if (data.topP !== undefined)
            updateData.topP = Number(data.topP);
        if (data.maxTokens !== undefined)
            updateData.maxTokens = Number(data.maxTokens);
        if (data.visibility !== undefined)
            updateData.visibility = data.visibility;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.avatar !== undefined)
            updateData.avatar = data.avatar;
        const updated = await this.agentRepo.updateAgent(organizationId, id, updateData);
        auditLogger_1.AuditLogger.log('AGENT_UPDATED', 'agent', { agentId: id, organizationId });
        return updated;
    }
    async softDeleteAgent(organizationId, id) {
        const agent = await this.agentRepo.findAgentById(organizationId, id);
        if (!agent)
            throw new AppError_1.NotFoundError('Agent not found');
        await this.agentRepo.softDeleteAgent(organizationId, id);
        auditLogger_1.AuditLogger.log('AGENT_DELETED', 'agent', { agentId: id, organizationId });
        return { success: true };
    }
}
exports.AgentService = AgentService;
