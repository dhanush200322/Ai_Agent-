export interface CreateWorkflowDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateWorkflowDto {
  name?: string;
  slug?: string;
  description?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

export interface CreateVersionDto {
  nodes: any[];
  connections: any[];
  metadata?: any;
}

export interface ExecuteWorkflowDto {
  variables?: Record<string, any>;
  agentId?: string;
}

export interface ApproveWorkflowDto {
  approved: boolean;
  notes?: string;
}
