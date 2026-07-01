import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';

export interface VaultSecret {
  id: string;
  name: string;
  description?: string;
  category: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export const vaultKeys = {
  all: ['vault'] as const,
  lists: () => [...vaultKeys.all, 'list'] as const,
  list: (category?: string) => [...vaultKeys.lists(), { category }] as const,
  details: () => [...vaultKeys.all, 'detail'] as const,
  detail: (id: string) => [...vaultKeys.details(), id] as const,
  leases: () => [...vaultKeys.all, 'lease'] as const,
  lease: (id: string) => [...vaultKeys.leases(), id] as const,
};

// Hook: Get all active secrets
export const useSecrets = (category?: string) => {
  return useQuery({
    queryKey: vaultKeys.list(category),
    queryFn: async (): Promise<VaultSecret[]> => {
      const response = await api.get('/vault', { params: { category } });
      return response.data;
    },
  });
};

// Hook: Get Secret details (we fetch the whole list and find the specific one for metadata)
export const useSecretMetadata = (id: string) => {
  return useQuery({
    queryKey: vaultKeys.list(),
    queryFn: async (): Promise<VaultSecret[]> => {
      const response = await api.get('/vault');
      return response.data;
    },
    select: (secrets) => secrets.find(s => s.id === id),
  });
};

// Hook: Retrieve decrypted secret value
export const useRetrieveSecret = (id: string) => {
  return useQuery({
    queryKey: vaultKeys.detail(id),
    queryFn: async (): Promise<{ value: string }> => {
      const response = await api.get(`/vault/${id}`);
      return response.data;
    },
    enabled: false, // Must be triggered manually
    gcTime: 0, // Never cache decrypted secrets
    staleTime: 0,
  });
};

// Hook: Store/Create Secret
export const useCreateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; value: string; category: string; description?: string }) => {
      const response = await api.post('/vault', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.lists() });
    },
  });
};

// Hook: Rotate Secret
export const useRotateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newValue }: { id: string; newValue?: string }) => {
      const response = await api.post(`/vault/${id}/rotate`, { newValue });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vaultKeys.detail(variables.id) });
    },
  });
};

// Hook: Revoke Secret
export const useRevokeSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/vault/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.lists() });
    },
  });
};

// Hook: Create Lease
export const useCreateLease = () => {
  return useMutation({
    mutationFn: async ({ id, ttlSeconds, actorType }: { id: string; ttlSeconds: number; actorType?: string }) => {
      const response = await api.post(`/vault/${id}/lease`, { ttlSeconds, actorType });
      return response.data;
    },
  });
};

// Hook: Retrieve Lease Value
export const useRetrieveLease = (leaseId: string) => {
  return useQuery({
    queryKey: vaultKeys.lease(leaseId),
    queryFn: async (): Promise<{ value: string }> => {
      const response = await api.get(`/vault/lease/${leaseId}`);
      return response.data;
    },
    enabled: false, // Manual trigger
    gcTime: 0,
    staleTime: 0,
  });
};
