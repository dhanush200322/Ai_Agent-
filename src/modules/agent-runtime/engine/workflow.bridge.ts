import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class WorkflowBridge {
  public async triggerWorkflow(organizationId: string, workflowId: string, payload: any): Promise<string> {
    const execution = await prisma.workflowExecution.create({
      data: {
        organizationId,
        workflowId,
        workflowVersionId: 'default-version', // Mock for now, in prod resolve latest published version
        status: 'PENDING',
        state: JSON.stringify(payload)
      }
    });
    return execution.id;
  }

  public async getWorkflowStatus(executionId: string): Promise<string | null> {
    const execution = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
    return execution?.status || null;
  }
}
