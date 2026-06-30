import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowService } from '../services/workflow.service';

export const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: workflowService.getWorkflows
  });
};

export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowService.getWorkflowDetails(id),
    enabled: !!id
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workflowService.createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });
};

export const useUpdateWorkflow = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => workflowService.updateWorkflow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', id] });
    }
  });
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workflowService.deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });
};

export const useWorkflowExecutions = () => {
  return useQuery({
    queryKey: ['workflow-executions'],
    queryFn: workflowService.getExecutions
  });
};

export const useWorkflowHistory = (id: string) => {
  return useQuery({
    queryKey: ['workflow-history', id],
    queryFn: () => workflowService.getWorkflowHistory(id),
    enabled: !!id
  });
};

export const useExecuteWorkflow = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { variables?: any; agentId?: string }) => 
      workflowService.executeWorkflow(id, params.variables, params.agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-history', id] });
    }
  });
};

export const usePublishWorkflow = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => workflowService.publishVersion(id, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', id] });
    }
  });
};

export const useWorkflowTemplates = () => {
  return useQuery({
    queryKey: ['workflow-templates'],
    queryFn: workflowService.getTemplates
  });
};
