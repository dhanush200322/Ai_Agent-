import { Groq } from 'groq-sdk';
import { ChatMessage } from '../types/chat.types';
import { AppError } from '../../../shared/errors/AppError';

export class GroqService {
  private groq: Groq;
  private readonly defaultModel = 'llama-3.1-8b-instant';

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not defined in environment variables');
    }
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      timeout: 30000,
      maxRetries: 3,
    });
  }

  /**
   * Generates a streaming chat completion from Groq
   */
  async generateChatStream(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    }
  ) {
    try {
      const stream = await this.groq.chat.completions.create({
        messages: messages as any,
        model: this.defaultModel,
        stream: true,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 1024,
        top_p: options?.topP ?? 0.95,
      });
      return stream;
    } catch (error: any) {
      console.error('[GroqService] Stream Generation Failed', error);
      throw new AppError('Failed to generate response from LLM', 500);
    }
  }

  /**
   * Generates a non-streaming chat completion from Groq
   * Useful for Tool Call loops in Planner
   */
  async generateChatCompletion(
    messages: any[], // using any to support tool call schemas
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      tools?: any[];
      tool_choice?: "auto" | "none";
    }
  ) {
    try {
      const response = await this.groq.chat.completions.create({
        messages,
        model: this.defaultModel,
        stream: false,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 1024,
        top_p: options?.topP ?? 0.95,
        tools: options?.tools?.length ? options.tools : undefined,
        tool_choice: options?.tool_choice ?? (options?.tools?.length ? "auto" : "none")
      });
      return response.choices[0].message;
    } catch (error: any) {
      console.error('[GroqService] Completion Generation Failed', error);
      throw new AppError('Failed to generate response from LLM', 500);
    }
  }
}
