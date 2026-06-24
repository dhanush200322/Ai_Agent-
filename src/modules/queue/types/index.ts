import { JobPriority } from '@prisma/client';

export enum StandardQueueName {
  CHAT_DEFAULT = 'chat.default',
  CHAT_PRIORITY = 'chat.priority',
  WORKFLOW_DEFAULT = 'workflow.default',
  WORKFLOW_PRIORITY = 'workflow.priority',
  PLUGIN_INSTALL = 'plugin.install',
  PLUGIN_EXECUTION = 'plugin.execution',
  TOOL_EXECUTION = 'tool.execution',
  EMAIL = 'email',
  NOTIFICATION = 'notification',
  EMBEDDING = 'embedding',
  MULTI_AGENT = 'multi-agent',
  SCHEDULER = 'scheduler',
}

export interface JobPayloadContract {
  id: string;
  organizationId: string;
  correlationId: string;
  traceId: string;
  priority: JobPriority;
  retries: number;
  payload: any;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface JobProgressEvent {
  jobId: string;
  progress: number; // 0 to 100
  message?: string;
}
