import { ResolvedTool } from '../services/tool-resolver.service';

export interface ExecutorContext {
  tool: ResolvedTool;
  args: Record<string, any>;
  organizationId: string;
  agentId: string;
  userId: string;
  conversationId: string;
}

export abstract class ToolExecutor {
  abstract execute(context: ExecutorContext): Promise<string>;
}
