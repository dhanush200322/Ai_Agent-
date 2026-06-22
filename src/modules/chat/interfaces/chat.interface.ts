export interface ChatCompletionRequest {
  agentId: string;
  message: string;
  knowledgeBaseIds?: string[]; // Optional: restrict to specific KBs
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export interface Citation {
  document: string;
  page: number;
  chunkIndex: number;
  score: number;
}

export interface ChatCompletionResponse {
  answer: string;
  sources: Citation[];
}

export interface RetrievalResult {
  id: string;
  score: number;
  content: string;
  documentId: string;
  knowledgeBaseId: string;
  fileName: string;
  page: number;
  chunkIndex: number;
}
