"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqService = void 0;
const groq_sdk_1 = require("groq-sdk");
const AppError_1 = require("../../../shared/errors/AppError");
class GroqService {
    groq;
    defaultModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is not defined in environment variables');
        }
        this.groq = new groq_sdk_1.Groq({
            apiKey,
            timeout: 30000,
            maxRetries: 3,
        });
    }
    resolveModel(requestedModel) {
        if (process.env.GROQ_MODEL) {
            return process.env.GROQ_MODEL;
        }
        if (requestedModel &&
            !requestedModel.toLowerCase().startsWith('gpt-4') &&
            !requestedModel.toLowerCase().startsWith('gpt-3')) {
            return requestedModel;
        }
        return this.defaultModel;
    }
    /**
     * Generates a streaming chat completion from Groq
     */
    async generateChatStream(messages, options) {
        try {
            const model = this.resolveModel(options?.model);
            const stream = await this.groq.chat.completions.create({
                messages: messages,
                model,
                stream: true,
                temperature: options?.temperature ?? 0.2,
                max_tokens: options?.maxTokens ?? 4096,
                top_p: options?.topP ?? 0.95,
            });
            return stream;
        }
        catch (error) {
            console.error('[GroqService] Stream Generation Failed', error);
            throw new AppError_1.AppError('Failed to generate response from LLM', 500);
        }
    }
    /**
     * Generates a non-streaming chat completion from Groq
     * Useful for Tool Call loops in Planner
     */
    async generateChatCompletion(messages, // using any to support tool call schemas
    options) {
        try {
            const model = this.resolveModel(options?.model);
            const response = await this.groq.chat.completions.create({
                messages,
                model,
                stream: false,
                temperature: options?.temperature ?? 0.2,
                max_tokens: options?.maxTokens ?? 4096,
                top_p: options?.topP ?? 0.95,
                tools: options?.tools?.length ? options.tools : undefined,
                tool_choice: options?.tool_choice ?? (options?.tools?.length ? "auto" : "none")
            });
            return response.choices[0].message;
        }
        catch (error) {
            console.error('[GroqService] Completion Generation Failed', error);
            throw new AppError_1.AppError('Failed to generate response from LLM', 500);
        }
    }
}
exports.GroqService = GroqService;
