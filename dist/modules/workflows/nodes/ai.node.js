"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiNode = void 0;
class AiNode {
    type = 'ai';
    async execute(node, context) {
        const promptTemplate = node.config?.prompt;
        if (!promptTemplate) {
            return { status: 'FAILED', error: 'Missing prompt' };
        }
        try {
            // Resolve prompt template
            const resolvedPrompt = context.variables.resolveString(promptTemplate);
            // We use the agent assigned to the workflow.
            const model = context.agent?.model || 'llama-3.1-8b-instant';
            const temperature = context.agent?.temperature || 0.7;
            // Ask LLM (simulating a direct Groq service call)
            const response = await context.llm.generateChatCompletion([{ role: 'user', content: resolvedPrompt }], { model, temperature });
            return {
                status: 'COMPLETED',
                output: { result: response.content }
            };
        }
        catch (e) {
            return { status: 'FAILED', error: e.message };
        }
    }
    validate(node) {
        if (!node.config?.prompt)
            return ['Missing prompt'];
        return null;
    }
}
exports.AiNode = AiNode;
