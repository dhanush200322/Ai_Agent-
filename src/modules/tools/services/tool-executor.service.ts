import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';
import { ExecutorContext, ToolExecutor } from '../executors/base.executor';
import { InternalExecutor } from '../executors/internal.executor';
import { HttpExecutor, WebhookExecutor, FunctionExecutor } from '../executors/external.executor';
import { ResolvedTool } from './tool-resolver.service';
import { AuditLogger } from '../../../shared/audit/auditLogger';



export class ToolExecutorService {
  private executors: Record<string, ToolExecutor> = {
    'InternalExecutor': new InternalExecutor(),
    'HttpExecutor': new HttpExecutor(),
    'WebhookExecutor': new WebhookExecutor(),
    'FunctionExecutor': new FunctionExecutor(),
  };

  async executeTool(params: {
    tool: ResolvedTool;
    args: any;
    organizationId: string;
    agentId: string;
    userId: string;
    conversationId: string;
  }): Promise<string> {
    const { tool, args, organizationId, agentId, userId, conversationId } = params;

    // 1. Create ToolExecution record
    // Since internal tools might not have an actual 'Tool' DB record id, we can link if available, 
    // or just store the name in input if toolId is missing.
    // For this implementation, we will log the execution if it has an ID, otherwise generic log.
    let executionRecordId: string | null = null;
    let actualToolId: string | null = null;

    if (tool.category !== 'INTERNAL') {
      const dbTool = await prisma.tool.findFirst({
        where: { name: tool.name, organizationId }
      });
      actualToolId = dbTool?.id || null;
    }

    if (actualToolId) {
      const exec = await prisma.toolExecution.create({
        data: {
          toolId: actualToolId,
          conversationId,
          agentId,
          status: 'RUNNING',
          input: JSON.stringify(args)
        }
      });
      executionRecordId = exec.id;
    }

    const startTime = Date.now();
    let result = '';
    let errorStr = '';

    try {
      const executor = this.executors[tool.executorName];
      if (!executor) throw new Error(`Executor ${tool.executorName} not found.`);

      const context: ExecutorContext = {
        tool,
        args,
        organizationId,
        agentId,
        userId,
        conversationId
      };

      result = await executor.execute(context);
    } catch (error: any) {
      errorStr = error.message;
    }

    const duration = Date.now() - startTime;

    // 2. Update ToolExecution record
    if (executionRecordId) {
      await prisma.toolExecution.update({
        where: { id: executionRecordId },
        data: {
          status: errorStr ? 'FAILED' : 'COMPLETED',
          output: errorStr ? null : String(result),
          error: errorStr ? String(errorStr) : null,
          duration,
          finishedAt: new Date()
        }
      });
    }

    AuditLogger.log('TOOL_EXECUTED', 'tool', { 
      toolName: tool.name, 
      organizationId, 
      agentId,
      status: errorStr ? 'FAILED' : 'COMPLETED',
      duration
    });

    if (errorStr) {
      return `Tool execution failed: ${errorStr}`;
    }

    return String(result);
  }
}
