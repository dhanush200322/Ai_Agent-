import { PrismaClient } from '@prisma/client';
import { GroqService } from './groq.service';

const prisma = new PrismaClient();
const groqService = new GroqService();

export class ConversationTitleService {
  /**
   * Generates a title if the conversation does not have one yet
   */
  async generateTitleIfMissing(conversationId: string, firstMessageContent: string) {
    const conversation = await (prisma as any).conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || conversation.title) {
      return; // Already has a title or doesn't exist
    }

    // Process asynchronously to avoid blocking the user
    this.generateTitle(conversationId, firstMessageContent).catch(err => {
      console.error('[ConversationTitle] Failed to generate title', err);
    });
  }

  private async generateTitle(conversationId: string, content: string) {
    const systemPrompt = "You are a title generator. Generate a very short, concise, and descriptive title (2-6 words) for the following user message. Do not use quotes or prefixes.";
    
    const responseStream = await groqService.generateChatStream([
      { role: 'system', content: systemPrompt },
      { role: 'user', content }
    ], { temperature: 0.3 });

    let finalTitle = '';
    for await (const chunk of responseStream) {
      finalTitle += chunk;
    }

    finalTitle = finalTitle.trim().replace(/^["']|["']$/g, '');

    await (prisma as any).conversation.update({
      where: { id: conversationId },
      data: { title: finalTitle }
    });
  }
}
