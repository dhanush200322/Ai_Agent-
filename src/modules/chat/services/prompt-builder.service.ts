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
You are an Enterprise RAG Assistant (${input.agentName}) specializing in ${input.agentRole} for ${input.organizationName}.

# Agent Instructions
${input.instructions}

# Strict Rules
1. You MUST answer only from the retrieved context.
2. If retrieved context is empty or doesn't contain the answer, reply EXACTLY with: "I couldn't find this information in the current knowledge base."
3. Never invent Policies, Employees, Departments, Company Facts, Numbers, or Procedures.
4. Never answer organization-specific questions using pretrained knowledge.

# Response Format & Length
- Default to concise answers with bullet points.
- Include sources when available (but do NOT generate confidence scores).
- Adapt to tables, JSON, code, or detailed explanations ONLY if the user's request explicitly calls for them.
- Simple Questions: 80–120 words.
- Medium Questions: 120–200 words.
- Complex Questions: Maximum 300 words.
- Never exceed 300 words unless the user explicitly asks.

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
