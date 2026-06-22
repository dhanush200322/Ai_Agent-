import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { ToolRegistryService } from './tool-registry.service';

export interface ResolvedTool {
  name: string;
  category: 'INTERNAL' | 'HTTP' | 'WEBHOOK' | 'FUNCTION';
  executorName: string;
  configuration?: any;
}

export class ToolResolverService {
  private registry = new ToolRegistryService();

  // Hardcoded internal tools for standard agent behaviors
  private internalTools = ['knowledge.search', 'memory.search', 'database.query', 'agent.info', 'organization.info'];

  async resolveTool(agentId: string, toolName: string): Promise<ResolvedTool> {
    // 1. Check if it's an internal platform tool
    if (this.internalTools.includes(toolName)) {
      return {
        name: toolName,
        category: 'INTERNAL',
        executorName: 'InternalExecutor'
      };
    }

    // 2. Fetch the Agent's configured tools from DB
    const agentTools = await this.registry.getAgentTools(agentId);
    
    const configuredTool = agentTools.find(at => at.tool.name === toolName);

    if (!configuredTool) {
      throw new NotFoundError(`Tool '${toolName}' is not assigned to this agent or does not exist.`);
    }

    if (!configuredTool.enabled || !configuredTool.tool.enabled) {
      throw new ValidationError(`Tool '${toolName}' is currently disabled.`);
    }

    let category: any = configuredTool.tool.category;
    let executorName = '';

    switch (category) {
      case 'HTTP':
        executorName = 'HttpExecutor';
        break;
      case 'WEBHOOK':
        executorName = 'WebhookExecutor';
        break;
      case 'FUNCTION':
        executorName = 'FunctionExecutor';
        break;
      default:
        throw new ValidationError(`Unsupported tool category: ${category}`);
    }

    return {
      name: toolName,
      category,
      executorName,
      configuration: configuredTool.configuration ? JSON.parse(configuredTool.configuration) : undefined
    };
  }
}
