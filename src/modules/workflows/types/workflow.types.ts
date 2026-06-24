
export interface WorkflowNodeData {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface WorkflowEdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: string; // Optional condition logic for edge
}

export interface WorkflowDefinition {
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
}

export interface NodeExecutionResult {
  status: 'COMPLETED' | 'FAILED' | 'PAUSED' | 'SKIPPED';
  output?: Record<string, any>;
  error?: string;
  nextNodes?: string[]; // IDs of nodes to execute next
}

export interface VariableScope {
  workflow: Record<string, any>;
  execution: Record<string, any>;
  environment: Record<string, any>;
  agent: Record<string, any>;
  secrets: Record<string, any>;
  outputs: Record<string, Record<string, any>>; // nodeId -> output
}
