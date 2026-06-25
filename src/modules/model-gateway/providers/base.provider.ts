export interface CompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface CompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export abstract class BaseProvider {
  abstract readonly name: string;

  abstract initialize(config: Record<string, any>): Promise<void>;
  
  abstract chatCompletion(request: CompletionRequest): Promise<CompletionResponse>;
  
  abstract chatCompletionStream(request: CompletionRequest): AsyncGenerator<any, void, unknown>;
  
  abstract generateEmbeddings(text: string | string[], model: string): Promise<number[][]>;
  
  abstract isHealthy(): Promise<boolean>;
}
