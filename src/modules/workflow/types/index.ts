export interface WorkflowNodeData {
  id: string; // custom nodeId from the definition, e.g. "1" or "node_1"
  type: string;
  label: string;
  config: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface WorkflowEdgeData {
  id: string;
  source: string; // source nodeId
  target: string; // target nodeId
  sourceHandle?: string;
  targetHandle?: string;
  condition?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
}

export interface NodeExecutionResult {
  status: 'COMPLETED' | 'FAILED' | 'PAUSED' | 'SKIPPED';
  output?: Record<string, any>;
  error?: string;
  nextNodes?: string[];
}

export interface VariableScope {
  workflow: Record<string, any>;
  execution: Record<string, any>;
  environment: Record<string, any>;
  agent: Record<string, any>;
  secrets: Record<string, any>;
  outputs: Record<string, Record<string, any>>; // nodeId -> output
}

export interface WorkflowMetrics {
  totalExecutions: number;
  successRate: number;
  failureRate: number;
  averageDuration: number;
  averageQueueTime: number;
  nodeExecutionTimes: Record<string, number>;
  retryCount: number;
  timeoutCount: number;
}
