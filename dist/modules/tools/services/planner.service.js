"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerService = void 0;
const prisma_1 = require("../../../shared/prisma");
const groq_service_1 = require("../../chat/services/groq.service");
const tool_resolver_service_1 = require("./tool-resolver.service");
const tool_policy_service_1 = require("./tool-policy.service");
const tool_executor_service_1 = require("./tool-executor.service");
class PlannerService {
    groqService = new groq_service_1.GroqService();
    resolver = new tool_resolver_service_1.ToolResolverService();
    policy = new tool_policy_service_1.ToolPolicyService();
    executor = new tool_executor_service_1.ToolExecutorService();
    async planAndExecuteTools(initialMessages, availableTools, context) {
        let messages = [...initialMessages];
        // Fetch Agent Configuration
        const agent = await prisma_1.prisma.agent.findUnique({
            where: { id: context.agentId },
            select: {
                maxPlannerDepth: true,
                plannerTemperature: true,
                plannerEnabled: true,
                toolCallingEnabled: true,
                plannerModel: true
            }
        });
        if (!agent)
            throw new Error("Agent not found");
        // If planner or tool calling is disabled, bypass execution
        if (!agent.plannerEnabled || !agent.toolCallingEnabled || !availableTools || availableTools.length === 0) {
            return messages;
        }
        let chainDepth = 0;
        const maxDepth = agent.maxPlannerDepth;
        while (chainDepth < maxDepth) {
            // 1. Ask LLM to plan or execute
            const llmResponse = await this.groqService.generateChatCompletion(messages, {
                tools: availableTools,
                tool_choice: 'auto',
                temperature: agent.plannerTemperature,
                model: agent.plannerModel || undefined
            });
            // Append assistant's response to the conversation history
            const assistantMessage = {
                role: 'assistant',
                content: llmResponse.content || null,
                tool_calls: llmResponse.tool_calls
            };
            messages.push(assistantMessage);
            // 2. Check if tools are needed
            if (!llmResponse.tool_calls || llmResponse.tool_calls.length === 0) {
                // No more tools needed, the LLM has decided to answer directly.
                // We will remove the last assistant message and let the controller stream the final answer
                // to provide a proper SSE stream, or keep it if we want to simulate a stream.
                // For standard architecture: remove the last text response, 
                // the controller will re-request it as a stream.
                messages.pop();
                break;
            }
            // 3. Execute requested tools
            const toolPromises = llmResponse.tool_calls.map(async (toolCall) => {
                try {
                    const toolName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments || '{}');
                    // Check Policy
                    await this.policy.evaluateToolPolicy({
                        userId: context.userId,
                        roleId: context.roleId,
                        organizationId: context.organizationId,
                        toolName,
                        chainDepth
                    });
                    // Resolve
                    const resolvedTool = await this.resolver.resolveTool(context.agentId, toolName);
                    // Execute
                    const result = await this.executor.executeTool({
                        tool: resolvedTool,
                        args,
                        organizationId: context.organizationId,
                        agentId: context.agentId,
                        userId: context.userId,
                        conversationId: context.conversationId
                    });
                    return {
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: toolName,
                        content: result
                    };
                }
                catch (error) {
                    // If a tool fails, return the error to the LLM so it knows
                    return {
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: toolCall.function.name,
                        content: `Error executing tool: ${error.message}`
                    };
                }
            });
            const toolResults = await Promise.all(toolPromises);
            // Append tool results back into the messages array
            messages.push(...toolResults);
            chainDepth++;
        }
        return messages;
    }
}
exports.PlannerService = PlannerService;
