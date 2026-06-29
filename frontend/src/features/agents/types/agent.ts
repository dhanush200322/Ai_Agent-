export type AgentVisibility = 'PRIVATE' | 'ORGANIZATION' | 'PUBLIC';
export type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar: string | null;
  model: string;
  systemPrompt: string | null;
  temperature: number;
  topP: number;
  maxTokens: number;
  visibility: AgentVisibility;
  status: AgentStatus;
  
  // Planner Configuration
  maxPlannerDepth: number;
  maxExecutionTimeMs: number;
  maxToolExecutions: number;
  maxParallelTools: number;
  plannerTemperature: number;
  plannerEnabled: boolean;
  toolCallingEnabled: boolean;
  plannerModel: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  organizationId: string;
  createdById: string;
}

export interface AgentListResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  items: Agent[];
}

export interface CreateAgentDTO {
  name: string;
  slug: string;
  description?: string;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  visibility?: AgentVisibility;
  avatar?: File;
}

export interface UpdateAgentDTO extends Partial<CreateAgentDTO> {
  status?: AgentStatus;
}
