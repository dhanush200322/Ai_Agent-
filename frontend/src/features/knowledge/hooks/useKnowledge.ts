import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeService } from '../services/knowledge.service';
import { CreateKnowledgeBaseDTO, UpdateKnowledgeBaseDTO } from '../types/knowledge';

// Knowledge Base Hooks
export const useKnowledgeBases = (page = 1, limit = 10, search?: string) => {
  return useQuery({
    queryKey: ['knowledgeBases', page, limit, search],
    queryFn: () => knowledgeService.getKnowledgeBases(page, limit, search),
  });
};

export const useKnowledgeBase = (id: string) => {
  return useQuery({
    queryKey: ['knowledgeBases', id],
    queryFn: () => knowledgeService.getKnowledgeBase(id),
    enabled: !!id,
  });
};

export const useCreateKnowledgeBase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateKnowledgeBaseDTO) => knowledgeService.createKnowledgeBase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
    },
  });
};

export const useUpdateKnowledgeBase = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateKnowledgeBaseDTO) => knowledgeService.updateKnowledgeBase(id, data),
    onSuccess: (updatedKB) => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
      queryClient.setQueryData(['knowledgeBases', id], updatedKB);
    },
  });
};

export const useDeleteKnowledgeBase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => knowledgeService.deleteKnowledgeBase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
    },
  });
};

// Document Hooks
export const useDocuments = (knowledgeBaseId: string) => {
  return useQuery({
    queryKey: ['documents', knowledgeBaseId],
    queryFn: () => knowledgeService.getDocuments(knowledgeBaseId),
    enabled: !!knowledgeBaseId,
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => knowledgeService.getDocument(id),
    enabled: !!id,
  });
};

export const useUploadDocument = (knowledgeBaseId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => knowledgeService.uploadDocument(knowledgeBaseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', knowledgeBaseId] });
      // Invalidate the KB to refresh doc counts if derived from queries
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] }); 
    },
  });
};

export const useCreateSource = (knowledgeBaseId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => knowledgeService.createSource(knowledgeBaseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', knowledgeBaseId] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] }); 
    },
  });
};

export const useDeleteDocument = (knowledgeBaseId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => knowledgeService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', knowledgeBaseId] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] }); 
    },
  });
};
