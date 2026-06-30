import { api } from '@/services/api/api';
import { Conversation, ConversationListResponse, Message, ChatCompletionRequest, Citation, ChatMetrics } from '../types/chat';
import { useAuthStore } from '@/features/auth/store';

export const chatService = {
  createConversation: async (agentId: string, sessionId?: string, isWidget?: boolean): Promise<Conversation> => {
    const endpoint = isWidget ? '/chat/widget/conversations' : '/chat/conversations';
    const response = await api.post(endpoint, { agentId, sessionId });
    return response.data.data;
  },

  listConversations: async (skip = 0, limit = 20, agentId?: string, status?: string): Promise<ConversationListResponse> => {
    try {
      const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
      if (agentId) params.append('agentId', agentId);
      if (status) params.append('status', status);

      const response = await api.get(`/chat/conversations?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.warn('403 Forbidden accessing conversations. Returning empty list.');
        return { items: [], total: 0 };
      }
      throw error;
    }
  },

  getConversationDetails: async (id: string): Promise<Conversation> => {
    const response = await api.get(`/chat/conversations/${id}`);
    return response.data.data;
  },

  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/chat/conversations/${id}`);
  },

  archiveConversation: async (id: string): Promise<void> => {
    await api.post(`/chat/conversations/${id}/archive`);
  },

  getConversationHistory: async (conversationId: string, skip = 0, limit = 50): Promise<Message[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    const response = await api.get(`/chat/messages/${conversationId}?${params.toString()}`);
    // Backend returns history. We might need to reverse it if it's ordered by createdAt desc
    return response.data.data;
  },

  streamChatCompletion: async (
    payload: ChatCompletionRequest & { isWidget?: boolean },
    callbacks: {
      onToken: (token: string) => void;
      onSources: (sources: Citation[]) => void;
      onMetrics: (metrics: ChatMetrics) => void;
      onError: (error: string) => void;
      onComplete: () => void;
    },
    signal?: AbortSignal
  ) => {
    const token = useAuthStore.getState().accessToken;
    const endpoint = payload.isWidget ? '/chat/widget/completions' : '/chat/completions';
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (!payload.isWidget && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Remove isWidget from payload before sending
    const { isWidget, ...requestPayload } = payload;

    try {
      let response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
        signal,
      });

      if (response.status === 401) {
        try {
          // Trigger the Axios interceptor to handle the token refresh
          await api.get('/auth/me'); 
          const newToken = useAuthStore.getState().accessToken;
          
          // Retry the stream with the new token
          if (!payload.isWidget) {
            headers['Authorization'] = `Bearer ${newToken}`;
          }
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestPayload),
            signal,
          });
        } catch (refreshErr) {
          throw new Error('Authentication session expired. Please log in again.');
        }
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Network response was not ok' }));
        throw new Error(err.message || 'Stream request failed');
      }

      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep the last incomplete chunk in the buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              callbacks.onComplete();
              return;
            }

            try {
              const event = JSON.parse(dataStr);
              if (event.type === 'token') callbacks.onToken(event.content);
              else if (event.type === 'sources') callbacks.onSources(event.content);
              else if (event.type === 'metrics') callbacks.onMetrics(event.content);
              else if (event.type === 'error') callbacks.onError(event.content);
            } catch (e) {
              console.error('Error parsing stream event', e, dataStr);
            }
          }
        }
      }
      callbacks.onComplete();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
        callbacks.onComplete();
      } else {
        callbacks.onError(error.message || 'Stream error');
      }
    }
  },
};
