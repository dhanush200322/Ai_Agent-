"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolResolverService = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const tool_registry_service_1 = require("./tool-registry.service");
class ToolResolverService {
    registry = new tool_registry_service_1.ToolRegistryService();
    // Hardcoded internal tools for standard agent behaviors
    internalTools = ['knowledge.search', 'memory.search', 'database.query', 'agent.info', 'organization.info'];
    async resolveTool(agentId, toolName) {
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
            throw new AppError_1.NotFoundError(`Tool '${toolName}' is not assigned to this agent or does not exist.`);
        }
        if (!configuredTool.enabled || !configuredTool.tool.enabled) {
            throw new AppError_1.ValidationError(`Tool '${toolName}' is currently disabled.`);
        }
        let category = configuredTool.tool.category;
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
                throw new AppError_1.ValidationError(`Unsupported tool category: ${category}`);
        }
        return {
            name: toolName,
            category,
            executorName,
            configuration: configuredTool.configuration ? JSON.parse(configuredTool.configuration) : undefined
        };
    }
}
exports.ToolResolverService = ToolResolverService;
