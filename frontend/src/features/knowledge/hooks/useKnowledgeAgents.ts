import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeService } from '../services/knowledge.service';

export const useKnowledgeAgents = (id: string) => {
  return useQuery({
    queryKey: ['knowledge', id, 'agents'],
    queryFn: () => knowledgeService.getConnectedAgents(id),
    enabled: !!id,
  });
};

export const useAttachAgents = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentIds: string[]) => knowledgeService.attachAgents(id, agentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', id, 'agents'] });
      // Invalidate agents list as well
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useDetachAgent = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentId: string) => knowledgeService.detachAgent(id, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', id, 'agents'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};
