"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const prisma_1 = require("../../../shared/prisma");
const retrieval_service_1 = require("../services/retrieval.service");
const context_builder_service_1 = require("../services/context-builder.service");
const prompt_builder_service_1 = require("../services/prompt-builder.service");
const groq_service_1 = require("../services/groq.service");
const citation_service_1 = require("../services/citation.service");
const metrics_service_1 = require("../services/metrics.service");
const AppError_1 = require("../../../shared/errors/AppError");
const conversation_service_1 = require("../services/conversation.service");
const conversation_message_service_1 = require("../services/conversation-message.service");
const memory_service_1 = require("../services/memory.service");
const memory_retrieval_service_1 = require("../services/memory-retrieval.service");
const memory_summary_service_1 = require("../services/memory-summary.service");
const conversation_title_service_1 = require("../services/conversation-title.service");
const planner_service_1 = require("../../tools/services/planner.service");
const tool_registry_service_1 = require("../../tools/services/tool-registry.service");
class ChatController {
    retrievalService = new retrieval_service_1.RetrievalService();
    contextBuilder = new context_builder_service_1.ContextBuilderService();
    promptBuilder = new prompt_builder_service_1.PromptBuilderService();
    groqService = new groq_service_1.GroqService();
    citationService = new citation_service_1.CitationService();
    conversationService = new conversation_service_1.ConversationService();
    messageService = new conversation_message_service_1.ConversationMessageService();
    memoryService = new memory_service_1.MemoryService();
    memoryRetrievalService = new memory_retrieval_service_1.MemoryRetrievalService();
    memorySummaryService = new memory_summary_service_1.MemorySummaryService();
    titleService = new conversation_title_service_1.ConversationTitleService();
    plannerService = new planner_service_1.PlannerService();
    toolRegistryService = new tool_registry_service_1.ToolRegistryService();
    streamChatCompletion = async (req, res) => {
        const user = req.user;
        const body = req.body;
        const metrics = new metrics_service_1.MetricsService();
        metrics.startTimer('Total Time');
        try {
            // 1. Validation & Isolation
            const agent = await prisma_1.prisma.agent.findUnique({
                where: { id: body.agentId },
                include: { knowledgeBases: true }
            });
            if (!agent || agent.organizationId !== user.organizationId) {
                throw new AppError_1.AppError('Invalid Agent or unauthorized', 404);
            }
            const conversation = await this.conversationService.getConversationById(body.conversationId, user.organizationId);
            if (conversation.agentId !== agent.id) {
                throw new AppError_1.AppError('Conversation does not belong to this agent', 403);
            }
            const organization = await prisma_1.prisma.organization.findUnique({ where: { id: user.organizationId } });
            // 2. Save User Message synchronously
            const userMessage = await this.messageService.saveMessage({
                conversationId: conversation.id,
                role: 'USER',
                content: body.message
            });
            // Update Conversation lastMessageAt
            await this.conversationService.updateLastMessageAt(conversation.id);
            // 3. Setup SSE Headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();
            // 4. Memory Retrieval
            metrics.startTimer('Memory Retrieval Time');
            const memories = await this.memoryRetrievalService.retrieveMemories(user.organizationId, conversation.id, body.message, 10);
            metrics.stopTimer('Memory Retrieval Time');
            // 5. Knowledge Retrieval
            metrics.startTimer('Knowledge Retrieval Time');
            const attachedKbIds = agent.knowledgeBases.map((akb) => akb.knowledgeBaseId);
            let chunks = [];
            if (attachedKbIds.length > 0) {
                chunks = await this.retrievalService.retrieveContext(user.organizationId, body.message, { knowledgeBaseIds: attachedKbIds, topK: 5 });
            }
            metrics.stopTimer('Knowledge Retrieval Time');
            metrics.setMetric('Chunks Retrieved Count', chunks.length);
            metrics.setMetric('Grounded Answer', chunks.length > 0 ? 'YES' : 'NO');
            // 5.5 Retrieval Validation
            if (chunks.length === 0) {
                const fallbackMsg = "I couldn't find this information in the current knowledge base.";
                // Simulate a token stream
                res.write(`data: ${JSON.stringify({ type: 'token', content: fallbackMsg })}\n\n`);
                const finalMetrics = metrics.getMetrics();
                res.write(`data: ${JSON.stringify({ type: 'metrics', content: finalMetrics })}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
                const assistantMessage = await this.messageService.saveMessage({
                    conversationId: conversation.id,
                    role: 'ASSISTANT',
                    content: fallbackMsg,
                    model: agent.model,
                    temperature: agent.temperature,
                    latency: 0,
                    streaming: true
                });
                this.titleService.generateTitleIfMissing(conversation.id, body.message);
                // @ts-ignore
                metrics.logMetrics(req.id || 'CHAT-STREAM');
                return;
            }
            // 6. Merge Context (Summary + Memories + Knowledge)
            const contextString = this.contextBuilder.buildContext(conversation.summary, memories, chunks);
            // 7. Prompt Builder
            metrics.startTimer('Prompt Time');
            const messages = this.promptBuilder.buildMessages({
                agentName: agent.name,
                agentRole: agent.description || 'Assistant',
                organizationName: organization?.name || 'Your Organization',
                instructions: agent.systemPrompt || '',
                conversationHistory: [], // Recent history will be handled by ContextBuilder or we can explicitly pass the last few messages here if needed, but summary is handled.
                retrievedContext: contextString,
                question: body.message,
            });
            metrics.stopTimer('Prompt Time');
            // 8. Planner and Tool Execution Loop
            metrics.startTimer('Planning Time');
            const agentTools = await this.toolRegistryService.getAgentTools(agent.id);
            const availableTools = this.promptBuilder.formatTools(agentTools);
            const finalMessages = await this.plannerService.planAndExecuteTools(messages, availableTools, {
                agentId: agent.id,
                organizationId: user.organizationId,
                userId: user.id,
                roleId: user.roleId,
                conversationId: conversation.id
            });
            metrics.stopTimer('Planning Time');
            // 9. Groq Stream Generation (Final Answer)
            metrics.startTimer('LLM Time');
            const stream = await this.groqService.generateChatStream(finalMessages, {
                temperature: agent.temperature,
            });
            let assistantResponse = '';
            for await (const chunk of stream) {
                const token = chunk.choices[0]?.delta?.content || '';
                if (token) {
                    assistantResponse += token;
                    res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
                }
            }
            metrics.stopTimer('LLM Time');
            // 10. Citations
            const citations = this.citationService.generateCitations(chunks);
            res.write(`data: ${JSON.stringify({ type: 'sources', content: citations })}\n\n`);
            // 11. Metrics
            const finalMetrics = metrics.getMetrics();
            res.write(`data: ${JSON.stringify({ type: 'metrics', content: finalMetrics })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
            // 12. Background Processes
            // Save Assistant Message
            const currentMetrics = metrics.getMetrics();
            const assistantMessage = await this.messageService.saveMessage({
                conversationId: conversation.id,
                role: 'ASSISTANT',
                content: assistantResponse,
                model: agent.model,
                temperature: agent.temperature,
                latency: currentMetrics['Total Time'] || 0,
                streaming: true
            });
            // Generate Background Embeddings and Save to Qdrant
            // Using Promises so we don't block the response which was already sent
            this.memoryService.saveMemory({
                conversationId: conversation.id,
                organizationId: user.organizationId,
                agentId: agent.id,
                messageId: userMessage.id,
                role: 'USER',
                content: body.message
            }).catch(err => console.error('[Background] Failed to save user memory', err));
            this.memoryService.saveMemory({
                conversationId: conversation.id,
                organizationId: user.organizationId,
                agentId: agent.id,
                messageId: assistantMessage.id,
                role: 'ASSISTANT',
                content: assistantResponse
            }).catch(err => console.error('[Background] Failed to save assistant memory', err));
            // Trigger Auto-Title if first message
            this.titleService.generateTitleIfMissing(conversation.id, body.message);
            // Trigger Auto-Summary Check
            this.memorySummaryService.checkAndSummarize(conversation.id, user.organizationId, agent.id);
            // Log metrics to console
            // @ts-ignore
            metrics.logMetrics(req.id || 'CHAT-STREAM');
        }
        catch (error) {
            console.error('[ChatController] Error:', error);
            if (!res.headersSent) {
                res.status(error.statusCode || 500).json({
                    success: false,
                    message: error.message || 'Internal Server Error',
                });
            }
            else {
                res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
                res.end();
            }
        }
    };
    streamWidgetChatCompletion = async (req, res) => {
        const body = req.body;
        const metrics = new metrics_service_1.MetricsService();
        metrics.startTimer('Total Time');
        try {
            // 1. Validation & Isolation
            const agent = await prisma_1.prisma.agent.findUnique({
                where: { id: body.agentId },
                include: { knowledgeBases: true }
            });
            if (!agent) {
                throw new AppError_1.AppError('Invalid Agent', 404);
            }
            const user = await prisma_1.prisma.user.findFirst({ where: { organizationId: agent.organizationId } });
            if (!user) {
                throw new AppError_1.AppError('Organization owner not found', 404);
            }
            const conversation = await this.conversationService.getConversationById(body.conversationId, agent.organizationId);
            if (conversation.agentId !== agent.id) {
                throw new AppError_1.AppError('Conversation does not belong to this agent', 403);
            }
            const organization = await prisma_1.prisma.organization.findUnique({ where: { id: agent.organizationId } });
            // 2. Save User Message synchronously
            const userMessage = await this.messageService.saveMessage({
                conversationId: conversation.id,
                role: 'USER',
                content: body.message
            });
            // Update Conversation lastMessageAt
            await this.conversationService.updateLastMessageAt(conversation.id);
            // 3. Setup SSE Headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();
            // 4. Memory Retrieval
            metrics.startTimer('Memory Retrieval Time');
            const memories = await this.memoryRetrievalService.retrieveMemories(agent.organizationId, conversation.id, body.message, 10);
            metrics.stopTimer('Memory Retrieval Time');
            // 5. Knowledge Retrieval
            metrics.startTimer('Knowledge Retrieval Time');
            const attachedKbIds = agent.knowledgeBases.map((akb) => akb.knowledgeBaseId);
            let chunks = [];
            if (attachedKbIds.length > 0) {
                chunks = await this.retrievalService.retrieveContext(agent.organizationId, body.message, { knowledgeBaseIds: attachedKbIds, topK: 5 });
            }
            metrics.stopTimer('Knowledge Retrieval Time');
            metrics.setMetric('Chunks Retrieved Count', chunks.length);
            metrics.setMetric('Grounded Answer', chunks.length > 0 ? 'YES' : 'NO');
            // 5.5 Retrieval Validation
            if (chunks.length === 0) {
                const fallbackMsg = "I couldn't find this information in the current knowledge base.";
                res.write(`data: ${JSON.stringify({ type: 'token', content: fallbackMsg })}\n\n`);
                const finalMetrics = metrics.getMetrics();
                res.write(`data: ${JSON.stringify({ type: 'metrics', content: finalMetrics })}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
                const assistantMessage = await this.messageService.saveMessage({
                    conversationId: conversation.id,
                    role: 'ASSISTANT',
                    content: fallbackMsg,
                    model: agent.model,
                    temperature: agent.temperature,
                    latency: 0,
                    streaming: true
                });
                this.titleService.generateTitleIfMissing(conversation.id, body.message);
                return;
            }
            // 6. Merge Context (Summary + Memories + Knowledge)
            const contextString = this.contextBuilder.buildContext(conversation.summary, memories, chunks);
            // 7. Prompt Builder
            metrics.startTimer('Prompt Time');
            const messages = this.promptBuilder.buildMessages({
                agentName: agent.name,
                agentRole: agent.description || 'Assistant',
                organizationName: organization?.name || 'Your Organization',
                instructions: agent.systemPrompt || '',
                conversationHistory: [],
                retrievedContext: contextString,
                question: body.message,
            });
            metrics.stopTimer('Prompt Time');
            // 8. Planner and Tool Execution Loop
            metrics.startTimer('Planning Time');
            const agentTools = await this.toolRegistryService.getAgentTools(agent.id);
            const availableTools = this.promptBuilder.formatTools(agentTools);
            const finalMessages = await this.plannerService.planAndExecuteTools(messages, availableTools, {
                agentId: agent.id,
                organizationId: agent.organizationId,
                userId: user.id,
                roleId: user.roleId,
                conversationId: conversation.id
            });
            metrics.stopTimer('Planning Time');
            // 9. Groq Stream Generation (Final Answer)
            metrics.startTimer('LLM Time');
            const stream = await this.groqService.generateChatStream(finalMessages, {
                temperature: agent.temperature,
            });
            let assistantResponse = '';
            for await (const chunk of stream) {
                const token = chunk.choices[0]?.delta?.content || '';
                if (token) {
                    assistantResponse += token;
                    res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
                }
            }
            metrics.stopTimer('LLM Time');
            // 10. Citations
            const citations = this.citationService.generateCitations(chunks);
            res.write(`data: ${JSON.stringify({ type: 'sources', content: citations })}\n\n`);
            // 11. Metrics
            const finalMetrics = metrics.getMetrics();
            res.write(`data: ${JSON.stringify({ type: 'metrics', content: finalMetrics })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
            // 12. Background Processes
            const currentMetrics = metrics.getMetrics();
            const assistantMessage = await this.messageService.saveMessage({
                conversationId: conversation.id,
                role: 'ASSISTANT',
                content: assistantResponse,
                model: agent.model,
                temperature: agent.temperature,
                latency: currentMetrics['Total Time'] || 0,
                streaming: true
            });
            this.memoryService.saveMemory({
                conversationId: conversation.id,
                organizationId: agent.organizationId,
                agentId: agent.id,
                messageId: userMessage.id,
                role: 'USER',
                content: body.message
            }).catch(err => console.error('[Background] Failed to save user memory', err));
            this.memoryService.saveMemory({
                conversationId: conversation.id,
                organizationId: agent.organizationId,
                agentId: agent.id,
                messageId: assistantMessage.id,
                role: 'ASSISTANT',
                content: assistantResponse
            }).catch(err => console.error('[Background] Failed to save assistant memory', err));
            this.titleService.generateTitleIfMissing(conversation.id, body.message);
            this.memorySummaryService.checkAndSummarize(conversation.id, agent.organizationId, agent.id);
        }
        catch (error) {
            console.error('[ChatController] Error:', error);
            if (!res.headersSent) {
                res.status(error.statusCode || 500).json({
                    success: false,
                    message: error.message || 'Internal Server Error',
                });
            }
            else {
                res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
                res.end();
            }
        }
    };
}
exports.ChatController = ChatController;
