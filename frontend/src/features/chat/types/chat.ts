export type ConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  model: string;
  status: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  summary?: string;
  status: ConversationStatus;
  agentId: string;
  organizationId: string;
  userId: string;
  sessionId?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  agent?: Pick<Agent, 'id' | 'name' | 'avatar' | 'updatedAt'>;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  model?: string;
  tokens?: number;
  latency?: number;
  streaming?: boolean;
  citations?: Citation[];
  createdAt: string;
}

export interface ChatCompletionRequest {
  agentId: string;
  conversationId: string;
  message: string;
  knowledgeBaseIds?: string[];
}

export interface Citation {
  id: string;
  documentId: string;
  knowledgeBaseId: string;
  score: number;
  snippet: string;
  fileName: string;
  originalName: string;
  page?: number;
}

export interface ChatMetrics {
  'Total Time'?: number;
  'Memory Retrieval Time'?: number;
  'Knowledge Retrieval Time'?: number;
  'Prompt Time'?: number;
  'Planning Time'?: number;
  'LLM Time'?: number;
  'Chunks Retrieved Count'?: number;
}

export interface StreamEvent {
  type: 'token' | 'sources' | 'metrics' | 'error';
  content: string | Citation[] | ChatMetrics | any;
}

export interface ConversationListResponse {
  items: Conversation[];
  total: number;
}
