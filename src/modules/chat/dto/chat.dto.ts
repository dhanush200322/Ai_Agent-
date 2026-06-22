export class ChatCompletionDto {
  agentId!: string;
  conversationId!: string;
  message!: string;
  knowledgeBaseIds?: string[];
}
