import { BaseProvider, CompletionRequest, CompletionResponse } from './base.provider';

export class GeminiProvider extends BaseProvider {
  name = 'gemini';
  async initialize(config: Record<string, any>): Promise<void> {}
  async chatCompletion(request: CompletionRequest): Promise<CompletionResponse> { return {} as any; }
  async *chatCompletionStream(request: CompletionRequest): AsyncGenerator<any, void, unknown> {}
  async generateEmbeddings(text: string | string[], model: string): Promise<number[][]> { return []; }
  async isHealthy(): Promise<boolean> { return true; }
}
