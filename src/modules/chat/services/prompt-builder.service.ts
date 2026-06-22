import { ChatMessage } from '../types/chat.types';
import { ToolDefinition } from '../../tools/types/tool.types';

export interface PromptInput {
  agentName: string;
  agentRole: string;
  organizationName: string;
  instructions: string;
  conversationHistory: ChatMessage[];
  retrievedContext: string;
  question: string;
  outputFormat?: string;
}

export class PromptBuilderService {
  /**
   * Constructs the final prompt string/messages payload for the LLM.
   */
  buildMessages(input: PromptInput): ChatMessage[] {
    const systemPrompt = `
You are ${input.agentName}, an Enterprise AI Assistant specializing in ${input.agentRole}.
You work for the organization: ${input.organizationName}.

# Agent Instructions
${input.instructions}

# Output Format
${input.outputFormat || 'Respond directly and professionally in Markdown.'}

# strict Rules
1. Only answer using the supplied knowledge context below.
2. Never hallucinate or invent information outside of the context.
3. If the answer does not exist in the context, respond EXACTLY with: "I couldn't find this information in the uploaded knowledge."

# Retrieved Context (Memories & Knowledge)
${input.retrievedContext ? input.retrievedContext : 'No context retrieved.'}
    `.trim();

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Append history
    if (input.conversationHistory && input.conversationHistory.length > 0) {
      messages.push(...input.conversationHistory);
    }

    // Append the current question
    messages.push({ role: 'user', content: input.question });

    return messages;
  }

  /**
   * Formats AgentTool configurations from the DB into the OpenAI/Groq Tool Call JSON Schema
   */
  formatTools(agentTools: any[]): ToolDefinition[] {
    return agentTools
      .filter(at => at.enabled && at.tool.enabled)
      .map(at => {
        let parameters = {
          type: "object",
          properties: {},
          required: []
        };
        
        if (at.tool.parameters) {
          try {
            parameters = JSON.parse(at.tool.parameters);
          } catch (e) {
            console.error(`Failed to parse parameters for tool ${at.tool.name}`, e);
          }
        }

        return {
          type: "function",
          function: {
            name: at.tool.name,
            description: at.tool.description,
            parameters
          }
        } as ToolDefinition;
      });
  }
}
