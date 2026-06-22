import { PrismaClient } from '@prisma/client';
import { GroqService } from './groq.service';
import { MemoryService } from './memory.service';

const prisma = new PrismaClient();
const groqService = new GroqService();
const memoryService = new MemoryService();

export class MemorySummaryService {
  /**
   * Check if a conversation needs to be summarized
   */
  async checkAndSummarize(conversationId: string, organizationId: string, agentId: string) {
    const messageCount = await (prisma as any).conversationMessage.count({
      where: { conversationId }
    });

    const agg = await (prisma as any).conversationMessage.aggregate({
      where: { conversationId },
      _sum: { tokens: true }
    });

    const totalTokens = agg._sum.tokens || 0;

    if (messageCount > 50 || totalTokens > 10000) {
      // Trigger summary generation asynchronously
      this.generateSummary(conversationId, organizationId, agentId).catch(err => {
        console.error('[MemorySummary] Failed to generate summary', err);
      });
    }
  }

  /**
   * Actually perform the summarization
   */
  private async generateSummary(conversationId: string, organizationId: string, agentId: string) {
    const conversation = await (prisma as any).conversation.findUnique({
      where: { id: conversationId },
      include: {
        agent: true
      }
    });

    if (!conversation) return;

    // Fetch the recent history that hasn't been archived yet
    // Since we aren't archiving natively in the DB structure strictly right now, 
    // we just fetch all or top N. Let's just grab the last 50.
    const messages = await (prisma as any).conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    messages.reverse();

    if (messages.length === 0) return;

    let textToSummarize = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
    if (conversation.summary) {
      textToSummarize = `Previous Summary:\n${conversation.summary}\n\nNew Messages:\n${textToSummarize}`;
    }

    const systemPrompt = "You are a memory compressor. Summarize the provided conversation flow clearly and concisely. Highlight core decisions, facts, and user preferences. Do not use conversational filler.";
    
    // Generate the summary via LLM
    const responseStream = await groqService.generateChatStream([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: textToSummarize }
    ], { temperature: 0.3 });

    let finalSummary = '';
    for await (const chunk of responseStream) {
      finalSummary += chunk;
    }

    // 1. Update the Conversation DB Model
    await (prisma as any).conversation.update({
      where: { id: conversationId },
      data: { summary: finalSummary }
    });

    // 2. Save as LONG_TERM / SUMMARY memory in Vector DB
    await memoryService.saveMemory({
      conversationId,
      organizationId,
      agentId,
      role: 'SYSTEM',
      content: `Conversation Summary: ${finalSummary}`,
      memoryType: 'SUMMARY'
    });

    // 3. (Optional) Archive Messages
    // In a strict implementation we might delete or mark them as archived, but skipping deletion to preserve audit history.
  }
}
