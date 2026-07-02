"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationTitleService = void 0;
const prisma_1 = require("../../../shared/prisma");
const groq_service_1 = require("./groq.service");
const groqService = new groq_service_1.GroqService();
class ConversationTitleService {
    /**
     * Generates a title if the conversation does not have one yet
     */
    async generateTitleIfMissing(conversationId, firstMessageContent) {
        const conversation = await prisma_1.prisma.conversation.findUnique({
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
    async generateTitle(conversationId, content) {
        const systemPrompt = "You are a title generator. Generate a very short, concise, and descriptive title (2-6 words) for the following user message. Do not use quotes or prefixes.";
        const responseStream = await groqService.generateChatStream([
            { role: 'system', content: systemPrompt },
            { role: 'user', content }
        ], { temperature: 0.3 });
        let finalTitle = '';
        for await (const chunk of responseStream) {
            finalTitle += chunk.choices[0]?.delta?.content || '';
        }
        finalTitle = finalTitle.trim().replace(/^["']|["']$/g, '');
        await prisma_1.prisma.conversation.update({
            where: { id: conversationId },
            data: { title: finalTitle }
        });
    }
}
exports.ConversationTitleService = ConversationTitleService;
