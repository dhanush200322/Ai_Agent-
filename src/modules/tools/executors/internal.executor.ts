import { ToolExecutor, ExecutorContext } from './base.executor';
import { RetrievalService } from '../../chat/services/retrieval.service';
import { MemoryRetrievalService } from '../../chat/services/memory-retrieval.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InternalExecutor extends ToolExecutor {
  private retrievalService = new RetrievalService();
  private memoryRetrievalService = new MemoryRetrievalService();

  async execute(context: ExecutorContext): Promise<string> {
    const { tool, args, organizationId, conversationId } = context;

    switch (tool.name) {
      case 'knowledge.search':
        return this.handleKnowledgeSearch(organizationId, args);
      case 'memory.search':
        return this.handleMemorySearch(organizationId, conversationId, args);
      case 'database.query':
        return this.handleDatabaseQuery(organizationId, args);
      case 'agent.info':
        return this.handleAgentInfo(context.agentId as string);
      case 'organization.info':
        return this.handleOrganizationInfo(organizationId);
      default:
        throw new Error(`Internal tool ${tool.name} is not supported.`);
    }
  }

  private async handleKnowledgeSearch(organizationId: string, args: Record<string, any>) {
    const query = args.query;
    if (!query) return JSON.stringify({ error: 'Missing query argument' });
    
    // We assume the tool config specifies which knowledge bases are allowed, 
    // or we search across the organization context
    try {
      const results = await this.retrievalService.retrieveContext(organizationId, query, { topK: 5 });
      if (!results.length) return "No relevant knowledge found.";
      
      const formatted = results.map(r => `Document: ${r.fileName || 'Unknown'}\nContent: ${r.content}`).join('\n\n');
      return formatted;
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  }

  private async handleMemorySearch(organizationId: string, conversationId: string, args: Record<string, any>) {
    const query = args.query;
    if (!query) return JSON.stringify({ error: 'Missing query argument' });

    try {
      const results = await this.memoryRetrievalService.retrieveMemories(organizationId, conversationId, query, 5);
      if (!results.length) return "No relevant memories found.";

      const formatted = results.map(r => `Memory (Type: ${r.memoryType}): ${r.content}`).join('\n\n');
      return formatted;
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  }

  private async handleDatabaseQuery(_organizationId: string, _args: Record<string, any>) {
    // Highly restricted parameter-only query for safety, or generic read-only access
    // This requires strict configuration in tool config. For now, returning a mock or simple stats.
    return "Read-only database queries are not fully implemented in the current internal platform environment. Requires safe execution container.";
  }

  private async handleAgentInfo(agentId: string) {
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) return "Agent not found.";
    return `Agent Name: ${agent.name}\nDescription: ${agent.description}\nModel: ${agent.model}\nSystem Prompt: ${agent.systemPrompt}`;
  }

  private async handleOrganizationInfo(organizationId: string) {
    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) return "Organization not found.";
    return `Organization Name: ${org.name}\nIndustry: ${org.industry}\nWebsite: ${org.website}`;
  }
}
