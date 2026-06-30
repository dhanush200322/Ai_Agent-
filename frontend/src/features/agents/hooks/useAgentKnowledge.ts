import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '../services/agent.service';

export const useAgentKnowledgeBases = (id: string) => {
  return useQuery({
    queryKey: ['agents', id, 'knowledge'],
    queryFn: () => agentService.getKnowledgeBases(id),
    enabled: !!id,
  });
};

export const useAttachKnowledgeBases = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (knowledgeBaseIds: string[]) => agentService.attachKnowledgeBases(id, knowledgeBaseIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', id, 'knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });
};

export const useDetachKnowledgeBase = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (kbId: string) => agentService.detachKnowledgeBase(id, kbId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', id, 'knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });
};
