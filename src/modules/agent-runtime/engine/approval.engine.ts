import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class ApprovalEngine {
  public async requestHumanApproval(executionId: string, nodeId: string): Promise<string> {
    const approval = await prisma.workflowApproval.create({
      data: {
        executionId,
        nodeId,
        status: 'PENDING'
      }
    });

    // Pause agent execution while waiting for human
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: { status: 'PAUSED' }
    });

    return approval.id;
  }

  public async getApprovalStatus(approvalId: string): Promise<'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'> {
    const approval = await prisma.workflowApproval.findUnique({ where: { id: approvalId } });
    if (!approval) throw new Error('Approval not found');
    return approval.status;
  }
}
