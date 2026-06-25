export interface ExecutionContext {
  executionId: string;
  agentId: string;
  organizationId: string;
  sessionId?: string;
  variables: Record<string, any>;
}

export interface AgentExecutionInput {
  organizationId: string;
  agentId: string;
  sessionId?: string;
  goal: string;
  variables?: Record<string, any>;
}

export interface AgentExecutionResult {
  executionId: string;
  status: string;
  result?: string;
  error?: string;
  metrics?: {
    promptTokens: number;
    completionTokens: number;
    totalLatency: number;
  };
}

export interface PlanningStep {
  id: string;
  description: string;
  dependencies?: string[];
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  result?: any;
}
