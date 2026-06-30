import { api } from '@/services/api/api';
import { Agent, AgentListResponse, CreateAgentDTO, UpdateAgentDTO } from '../types/agent';

export const agentService = {
  getAgents: async (page = 1, limit = 10, search?: string): Promise<AgentListResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);

      const response = await api.get(`/agents?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) return { items: [], total: 0, page: 1, limit: 10, pages: 0 };
      throw error;
    }
  },

  getAgent: async (id: string): Promise<Agent> => {
    const response = await api.get(`/agents/${id}`);
    return response.data.data;
  },

  createAgent: async (data: CreateAgentDTO): Promise<Agent> => {
    let payload: any = data;
    
    // If there's an avatar file, we must use FormData
    if (data.avatar instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value instanceof File ? value : value.toString());
        }
      });
      payload = formData;
    }

    const response = await api.post('/agents', payload, {
      headers: data.avatar instanceof File ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data.data;
  },

  updateAgent: async (id: string, data: UpdateAgentDTO): Promise<Agent> => {
    let payload: any = data;
    
    // If there's an avatar file, we must use FormData
    if (data.avatar instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value instanceof File ? value : value.toString());
        }
      });
      payload = formData;
    }

    const response = await api.patch(`/agents/${id}`, payload, {
      headers: data.avatar instanceof File ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data.data;
  },

  deleteAgent: async (id: string): Promise<void> => {
    await api.delete(`/agents/${id}`);
  },

  // Knowledge Base Association
  getKnowledgeBases: async (id: string): Promise<any[]> => {
    const response = await api.get(`/agents/${id}/knowledge`);
    return response.data.data;
  },

  attachKnowledgeBases: async (id: string, knowledgeBaseIds: string[]): Promise<void> => {
    await api.post(`/agents/${id}/knowledge`, { knowledgeBaseIds });
  },

  detachKnowledgeBase: async (id: string, kbId: string): Promise<void> => {
    await api.delete(`/agents/${id}/knowledge/${kbId}`);
  }
};

