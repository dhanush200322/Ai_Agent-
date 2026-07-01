import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  country?: string;
  timezone?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  createdAt: string;
}

export interface OrgStats {
  totalUsers: number;
  activeUsers: number;
  totalAgents: number;
  activeAgents: number;
  totalConversations: number;
  totalKnowledgeBases: number;
  workflowsRun: number;
  storageUsageBytes: number;
  apiUsageCost: number;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  details?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export const organizationKeys = {
  all: ['organization'] as const,
  detail: () => [...organizationKeys.all, 'detail'] as const,
  stats: () => [...organizationKeys.all, 'stats'] as const,
};

// Hook: Get Organization
export const useOrganization = () => {
  return useQuery({
    queryKey: organizationKeys.detail(),
    queryFn: async (): Promise<Organization> => {
      const response = await api.get('/organization');
      return response.data.data;
    },
  });
};

// Hook: Get Organization Stats
export const useOrganizationStats = () => {
  return useQuery({
    queryKey: organizationKeys.stats(),
    queryFn: async (): Promise<OrgStats> => {
      const response = await api.get('/organization/stats');
      return response.data.data;
    },
  });
};

// Hook: Update Organization
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Organization>) => {
      const response = await api.patch('/organization', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail() });
    },
  });
};

// Hook: Transfer Ownership
export const useTransferOwnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOwnerId: string) => {
      const response = await api.post('/organization/transfer-ownership', { newOwnerId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail() });
    },
  });
};
// Hook: Get Organization Activity
export const useOrganizationActivity = () => {
  return useQuery({
    queryKey: [...organizationKeys.all, 'activity'],
    queryFn: async (): Promise<AuditLog[]> => {
      const response = await api.get('/organization/activity');
      return response.data.data;
    },
  });
};
