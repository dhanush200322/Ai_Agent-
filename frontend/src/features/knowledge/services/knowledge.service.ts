import { api } from '@/services/api/api';
import {
  KnowledgeBase,
  KnowledgeListResponse,
  KnowledgeDocument,
  CreateKnowledgeBaseDTO,
  UpdateKnowledgeBaseDTO
} from '../types/knowledge';

export const knowledgeService = {
  getKnowledgeBases: async (page = 1, limit = 10, search?: string): Promise<KnowledgeListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (search) params.append('search', search);

    const res = await api.get(`/knowledge?${params.toString()}`);
    return res.data.data;
  },

  getKnowledgeBase: async (id: string): Promise<KnowledgeBase> => {
    const res = await api.get(`/knowledge/${id}`);
    return res.data.data;
  },

  createKnowledgeBase: async (data: CreateKnowledgeBaseDTO): Promise<KnowledgeBase> => {
    const res = await api.post('/knowledge', data);
    return res.data.data;
  },

  updateKnowledgeBase: async (id: string, data: UpdateKnowledgeBaseDTO): Promise<KnowledgeBase> => {
    const res = await api.patch(`/knowledge/${id}`, data);
    return res.data.data;
  },

  deleteKnowledgeBase: async (id: string): Promise<void> => {
    await api.delete(`/knowledge/${id}`);
  },

  uploadDocument: async (knowledgeBaseId: string, file: File): Promise<KnowledgeDocument> => {
    // api.postForm automatically handles FormData conversion and multipart/form-data headers,
    // overriding the default application/json header safely.
    const res = await api.postForm(`/knowledge/${knowledgeBaseId}/documents`, { file });
    return res.data.data;
  },

  createSource: async (knowledgeBaseId: string, payload: any): Promise<KnowledgeDocument> => {
    if (payload.type === 'bulk' && payload.data.file) {
      const res = await api.postForm(`/knowledge/${knowledgeBaseId}/sources`, { file: payload.data.file });
      return res.data.data;
    }
    const res = await api.post(`/knowledge/${knowledgeBaseId}/sources`, payload);
    return res.data.data;
  },

  getDocuments: async (knowledgeBaseId: string): Promise<KnowledgeDocument[]> => {
    const res = await api.get(`/knowledge/${knowledgeBaseId}/documents`);
    return res.data.data;
  },

  getDocument: async (id: string): Promise<KnowledgeDocument> => {
    const res = await api.get(`/knowledge/documents/${id}`);
    return res.data.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/knowledge/documents/${id}`);
  },

  // Agent connections
  getConnectedAgents: async (id: string): Promise<any[]> => {
    const res = await api.get(`/knowledge/${id}/agents`);
    return res.data.data;
  },

  attachAgents: async (id: string, agentIds: string[]): Promise<void> => {
    await api.post(`/knowledge/${id}/agents`, { agentIds });
  },

  detachAgent: async (id: string, agentId: string): Promise<void> => {
    await api.delete(`/knowledge/${id}/agents/${agentId}`);
  }
};

