import { api } from '@/services/api/api';

export const workflowService = {
  getWorkflows: async (): Promise<any[]> => {
    try {
      const response = await api.get('/workflows');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) return [];
      throw error;
    }
  },
  
  createWorkflow: async (data: { name: string; slug: string; description?: string }): Promise<any> => {
    const response = await api.post('/workflows', data);
    return response.data;
  },
  
  getWorkflowDetails: async (id: string): Promise<any> => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  updateWorkflow: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/workflows/${id}`, data);
    return response.data;
  },

  deleteWorkflow: async (id: string): Promise<any> => {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
  },

  getTemplates: async (): Promise<any[]> => {
    try {
      const response = await api.get('/workflows/templates');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) return [];
      throw error;
    }
  },

  getExecutions: async (): Promise<any[]> => {
    try {
      const response = await api.get('/workflows/executions');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) return [];
      throw error;
    }
  },

  getWorkflowHistory: async (id: string): Promise<any[]> => {
    try {
      const response = await api.get(`/workflows/${id}/history`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) return [];
      throw error;
    }
  },

  publishVersion: async (id: string, versionId: string): Promise<any> => {
    const response = await api.post(`/workflows/${id}/publish`, { versionId });
    return response.data;
  },

  executeWorkflow: async (id: string, variables: any = {}, agentId?: string): Promise<any> => {
    const payload: any = { variables };
    if (agentId) payload.agentId = agentId;
    const response = await api.post(`/workflows/${id}/execute`, payload);
    return response.data;
  },

  cancelExecution: async (executionId: string): Promise<any> => {
    const response = await api.post(`/workflows/${executionId}/cancel`);
    return response.data;
  },

  approveWorkflow: async (executionId: string, nodeId: string, approved: boolean, notes?: string): Promise<any> => {
    const response = await api.post(`/workflows/${executionId}/approve`, { nodeId, approved, notes });
    return response.data;
  },

  cloneWorkflow: async (id: string, data: { name: string; slug: string }): Promise<any> => {
    const response = await api.post(`/workflows/${id}/clone`, data);
    return response.data;
  }
};
