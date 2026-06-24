// @ts-nocheck
import { PrismaClient, WorkflowExecutionLog, NodeExecutionStatus } from '@prisma/client';
import { WorkflowExecutionContext } from './context';

const prisma = new PrismaClient();

export class StateManager {
  
  async saveState(context: WorkflowExecutionContext): Promise<void> {
    const stateStr = JSON.stringify(context.variables.getScope());
    await prisma.workflowExecution.update({
      where: { id: context.execution.id },
      data: { state: stateStr }
    });
  }

  async loadState(executionId: string): Promise<any> {
    const ex = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
    if (!ex || !ex.state) return null;
    return JSON.parse(ex.state);
  }

  async logNodeStart(executionId: string, nodeId: string, nodeType: string, input: any): Promise<WorkflowExecutionLog> {
    return prisma.workflowExecutionLog.create({
      data: {
        executionId,
        nodeId,
        nodeType,
        status: 'RUNNING',
        input: JSON.stringify(input)
      }
    });
  }

  async logNodeFinish(logId: string, status: NodeExecutionStatus, output: any, error?: string): Promise<WorkflowExecutionLog> {
    return prisma.workflowExecutionLog.update({
      where: { id: logId },
      data: {
        status,
        output: output ? JSON.stringify(output) : null,
        error: error || null,
        finishedAt: new Date()
      }
    });
  }

  async setExecutionStatus(executionId: string, status: any): Promise<void> {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { 
        status, 
        ...(status === 'COMPLETED' || status === 'FAILED' ? { finishedAt: new Date() } : {})
      }
    });
  }
}
