"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalExecutor = void 0;
const base_executor_1 = require("./base.executor");
const retrieval_service_1 = require("../../chat/services/retrieval.service");
const memory_retrieval_service_1 = require("../../chat/services/memory-retrieval.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class InternalExecutor extends base_executor_1.ToolExecutor {
    retrievalService = new retrieval_service_1.RetrievalService();
    memoryRetrievalService = new memory_retrieval_service_1.MemoryRetrievalService();
    async execute(context) {
        const { tool, args, organizationId, conversationId } = context;
        switch (tool.name) {
            case 'knowledge.search':
                return this.handleKnowledgeSearch(organizationId, args);
            case 'memory.search':
                return this.handleMemorySearch(organizationId, conversationId, args);
            case 'database.query':
                return this.handleDatabaseQuery(organizationId, args);
            case 'agent.info':
                return this.handleAgentInfo(context.agentId);
            case 'organization.info':
                return this.handleOrganizationInfo(organizationId);
            default:
                throw new Error(`Internal tool ${tool.name} is not supported.`);
        }
    }
    async handleKnowledgeSearch(organizationId, args) {
        const query = args.query;
        if (!query)
            return JSON.stringify({ error: 'Missing query argument' });
        // We assume the tool config specifies which knowledge bases are allowed, 
        // or we search across the organization context
        try {
            const results = await this.retrievalService.retrieveContext(organizationId, query, { topK: 5 });
            if (!results.length)
                return "No relevant knowledge found.";
            const formatted = results.map(r => `Document: ${r.fileName || 'Unknown'}\nContent: ${r.content}`).join('\n\n');
            return formatted;
        }
        catch (e) {
            return JSON.stringify({ error: e.message });
        }
    }
    async handleMemorySearch(organizationId, conversationId, args) {
        const query = args.query;
        if (!query)
            return JSON.stringify({ error: 'Missing query argument' });
        try {
            const results = await this.memoryRetrievalService.retrieveMemories(organizationId, conversationId, query, 5);
            if (!results.length)
                return "No relevant memories found.";
            const formatted = results.map(r => `Memory (Type: ${r.memoryType}): ${r.content}`).join('\n\n');
            return formatted;
        }
        catch (e) {
            return JSON.stringify({ error: e.message });
        }
    }
    async handleDatabaseQuery(_organizationId, _args) {
        // Highly restricted parameter-only query for safety, or generic read-only access
        // This requires strict configuration in tool config. For now, returning a mock or simple stats.
        return "Read-only database queries are not fully implemented in the current internal platform environment. Requires safe execution container.";
    }
    async handleAgentInfo(agentId) {
        const agent = await prisma.agent.findUnique({ where: { id: agentId } });
        if (!agent)
            return "Agent not found.";
        return `Agent Name: ${agent.name}\nDescription: ${agent.description}\nModel: ${agent.model}\nSystem Prompt: ${agent.systemPrompt}`;
    }
    async handleOrganizationInfo(organizationId) {
        const org = await prisma.organization.findUnique({ where: { id: organizationId } });
        if (!org)
            return "Organization not found.";
        return `Organization Name: ${org.name}\nIndustry: ${org.industry}\nWebsite: ${org.website}`;
    }
}
exports.InternalExecutor = InternalExecutor;
