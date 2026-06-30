export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface KnowledgeDocument {
  id: string;
  knowledgeBaseId: string;
  originalName: string;
  fileName?: string;
  mimeType?: string;
  extension?: string;
  size?: number;
  sourceType: string;
  status: 'PENDING' | 'PROCESSING' | 'EMBEDDING' | 'INDEXING' | 'COMPLETED' | 'FAILED' | 'DELETED';
  chunkCount?: number;
  processingTime?: number;
  embeddingModel?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface KnowledgeListResponse {
  items: KnowledgeBase[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DocumentListResponse {
  items: KnowledgeDocument[];
}

export interface CreateKnowledgeBaseDTO {
  name: string;
  description?: string;
}

export interface UpdateKnowledgeBaseDTO {
  name?: string;
  description?: string;
}
