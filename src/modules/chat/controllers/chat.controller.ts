import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RetrievalService } from '../services/retrieval.service';
import { ContextBuilderService } from '../services/context-builder.service';
import { PromptBuilderService } from '../services/prompt-builder.service';
import { GroqService } from '../services/groq.service';
import { CitationService } from '../services/citation.service';
import { MetricsService } from '../services/metrics.service';
import { ChatCompletionDto } from '../dto/chat.dto';
import { AppError } from '../../../shared/errors/AppError';

import { ConversationService } from '../services/conversation.service';
import { ConversationMessageService } from '../services/conversation-message.service';
import { MemoryService } from '../services/memory.service';
import { MemoryRetrievalService } from '../services/memory-retrieval.service';
import { MemorySummaryService } from '../services/memory-summary.service';
import { ConversationTitleService } from '../services/conversation-title.service';
import { PlannerService } from '../../tools/services/planner.service';
import { ToolRegistryService } from '../../tools/services/tool-registry.service';

const prisma = new PrismaClient();

export class ChatController {
  private retrievalService = new RetrievalService();
  private contextBuilder = new ContextBuilderService();
  private promptBuilder = new PromptBuilderService();
  private groqService = new GroqService();
  private citationService = new CitationService();

  private conversationService = new ConversationService();
  private messageService = new ConversationMessageService();
  private memoryService = new MemoryService();
  private memoryRetrievalService = new MemoryRetrievalService();
  private memorySummaryService = new MemorySummaryService();
  private titleService = new ConversationTitleService();
  private plannerService = new PlannerService();
  private toolRegistryService = new ToolRegistryService();

  public streamChatCompletion = async (req: Request, res: Response) => {
    const user = req.user!;
    const body: ChatCompletionDto = req.body;
    const metrics = new MetricsService();
    metrics.startTimer('Total Time');

    try {
      // 1. Validation & Isolation
      const agent = await prisma.agent.findUnique({ where: { id: body.agentId } });
      if (!agent || agent.organizationId !== user.organizationId) {
        throw new AppError('Invalid Agent or unauthorized', 404);
      }
      
      const conversation = await this.conversationService.getConversationById(body.conversationId, user.organizationId);
      if (conversation.agentId !== agent.id) {
        throw new AppError('Conversation does not belong to this agent', 403);
      }

      const organization = await prisma.organization.findUnique({ where: { id: user.organizationId } });

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
      const memories = await this.memoryRetrievalService.retrieveMemories(
        user.organizationId,
        conversation.id,
        body.message,
        10
      );
      metrics.stopTimer('Memory Retrieval Time');

      // 5. Knowledge Retrieval
      metrics.startTimer('Knowledge Retrieval Time');
      const chunks = await this.retrievalService.retrieveContext(
        user.organizationId,
        body.message,
        { knowledgeBaseIds: body.knowledgeBaseIds, topK: 5 }
      );
      metrics.stopTimer('Knowledge Retrieval Time');
      metrics.setMetric('Chunks Retrieved Count', chunks.length);

      // 6. Merge Context (Summary + Memories + Knowledge)
      const contextString = this.contextBuilder.buildContext(
        conversation.summary,
        memories,
        chunks
      );

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

      const finalMessages = await this.plannerService.planAndExecuteTools(
        messages,
        availableTools,
        {
          agentId: agent.id,
          organizationId: user.organizationId,
          userId: user.id,
          roleId: user.roleId,
          conversationId: conversation.id
        }
      );
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
        latency: (currentMetrics as any)['Total Time'] || 0,
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

    } catch (error: any) {
      console.error('[ChatController] Error:', error);
      if (!res.headersSent) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message || 'Internal Server Error',
        });
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
        res.end();
      }
    }
  };
}
