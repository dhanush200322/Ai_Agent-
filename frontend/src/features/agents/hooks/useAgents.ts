import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '../services/agent.service';
import { CreateAgentDTO, UpdateAgentDTO } from '../types/agent';

export const useAgents = (page = 1, limit = 10, search?: string) => {
  return useQuery({
    queryKey: ['agents', page, limit, search],
    queryFn: () => agentService.getAgents(page, limit, search),
  });
};

export const useAgent = (id: string) => {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: () => agentService.getAgent(id),
    enabled: !!id,
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAgentDTO) => agentService.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useUpdateAgent = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateAgentDTO) => agentService.updateAgent(id, data),
    onSuccess: (updatedAgent) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.setQueryData(['agents', id], updatedAgent);
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => agentService.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};
