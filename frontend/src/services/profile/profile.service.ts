import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';

export interface UserSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  lastActive: string;
  isCurrentSession: boolean;
  createdAt: string;
  device?: string;
  os?: string;
  browser?: string;
}

export const profileKeys = {
  all: ['profile'] as const,
  sessions: () => [...profileKeys.all, 'sessions'] as const,
};

// Hook: Update Profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData | { firstName?: string; lastName?: string; phone?: string }) => {
      let response;
      if (data instanceof FormData) {
        response = await api.patch('/users/profile', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.patch('/users/profile', data);
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

// Hook: Change Password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/auth/password/change', data);
      return response.data.data;
    },
  });
};

// Hook: Get Sessions
export const useSessions = () => {
  return useQuery({
    queryKey: profileKeys.sessions(),
    queryFn: async (): Promise<UserSession[]> => {
      const response = await api.get('/auth/sessions');
      return response.data.data;
    },
  });
};

// Hook: Revoke Session
export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/auth/sessions/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
    },
  });
};

// Hook: Revoke All Sessions
export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/auth/sessions');
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
    },
  });
};
