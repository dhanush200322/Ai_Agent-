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
  stats: () => [...vaultKeys.all, 'stats'] as const,
};

// Hook: Get Vault Stats
export const useVaultStats = () => {
  return useQuery({
    queryKey: vaultKeys.stats(),
    queryFn: async (): Promise<any> => {
      const response = await api.get('/vault/stats');
      return response.data.data;
    },
  });
};

// Hook: Get all active secrets
export const useSecrets = (category?: string) => {
  return useQuery({
    queryKey: vaultKeys.list(category),
    queryFn: async (): Promise<VaultSecret[]> => {
      const response = await api.get('/vault', { params: { category } });
      return response.data.data;
    },
  });
};

// Hook: Get Secret details
export const useSecretMetadata = (id: string) => {
  return useQuery({
    queryKey: vaultKeys.list(),
    queryFn: async (): Promise<VaultSecret[]> => {
      const response = await api.get('/vault');
      return response.data.data;
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
      return response.data.data;
    },
    enabled: false,
    gcTime: 0,
    staleTime: 0,
  });
};

// Hook: Store/Create Secret
export const useCreateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; value: string; category: string; description?: string }) => {
      const response = await api.post('/vault', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vaultKeys.stats() });
    },
  });
};

// Hook: Rotate Secret
export const useRotateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newValue }: { id: string; newValue?: string }) => {
      const response = await api.post(`/vault/${id}/rotate`, { newValue });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vaultKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: vaultKeys.stats() });
    },
  });
};

// Hook: Revoke Secret
export const useRevokeSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/vault/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vaultKeys.stats() });
    },
  });
};

// Hook: Create Lease
export const useCreateLease = () => {
  return useMutation({
    mutationFn: async ({ id, ttlSeconds, actorType }: { id: string; ttlSeconds: number; actorType?: string }) => {
      const response = await api.post(`/vault/${id}/lease`, { ttlSeconds, actorType });
      return response.data.data;
    },
  });
};

// Hook: Retrieve Lease Value
export const useRetrieveLease = (leaseId: string) => {
  return useQuery({
    queryKey: vaultKeys.lease(leaseId),
    queryFn: async (): Promise<{ value: string }> => {
      const response = await api.get(`/vault/lease/${leaseId}`);
      return response.data.data;
    },
    enabled: false,
    gcTime: 0,
    staleTime: 0,
  });
};
