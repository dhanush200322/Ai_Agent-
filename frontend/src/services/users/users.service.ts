import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isOwner: boolean;
  createdAt: string;
  lastLogin?: string;
  role: {
    id: string;
    name: string;
  };
}

export interface UserListResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: string) => [...usersKeys.lists(), { filters }] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

// Hook: Get Users
export const useUsers = (page = 1, limit = 10, search = '', status = '', roleId = '') => {
  return useQuery({
    queryKey: usersKeys.list(`page=${page}&limit=${limit}&search=${search}&status=${status}&roleId=${roleId}`),
    queryFn: async (): Promise<UserListResponse> => {
      const response = await api.get('/users', {
        params: { page, limit, search, status, roleId },
      });
      // Handle array vs paginated object based on backend behavior
      if (Array.isArray(response.data.data)) {
        return {
           data: response.data.data,
           meta: response.data.meta || { total: response.data.data.length, page: 1, limit: 10, totalPages: 1 }
        };
      }
      return response.data.data;
    },
  });
};

// Hook: Get User
export const useUser = (id: string) => {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: async (): Promise<User> => {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Hook: Update User Status
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }) => {
      const response = await api.patch(`/users/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) });
    },
  });
};

// Hook: Delete User
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/users/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

// Hook: Invite User
export const useInviteUser = () => {
  return useMutation({
    mutationFn: async (data: { email: string; roleId: string }) => {
      const response = await api.post('/users/invite', data);
      return response.data.data;
    },
  });
};
