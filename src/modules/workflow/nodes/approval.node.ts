import { WorkflowNodeInterface, NodeExecutionResult } from '../providers/workflow-node.interface';
import { WorkflowExecutionContext } from '../engine/context.engine';
import { prisma } from '../prisma';

export class ApprovalNode implements WorkflowNodeInterface {
  type = 'approval';

  async execute(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    await prisma.workflowApproval.create({
      data: {
        executionId: context.execution.id,
        nodeId: node.id,
        status: 'PENDING'
      }
    });

    return {
      status: 'PAUSED',
      output: { message: 'Waiting for human approval' }
    };
  }

  async resume(node: any, context: WorkflowExecutionContext, approvalData?: any): Promise<NodeExecutionResult> {
    const approvalRecord = await prisma.workflowApproval.findFirst({
      where: { executionId: context.execution.id, nodeId: node.id },
      orderBy: { requestedAt: 'desc' }
    });

    if (!approvalRecord) {
      return { status: 'FAILED', error: 'Approval record not found' };
    }

    if (approvalData?.approved === true) {
      await prisma.workflowApproval.update({
        where: { id: approvalRecord.id },
        data: { status: 'APPROVED', approvedAt: new Date() }
      });
      return { status: 'COMPLETED', output: { approved: true, notes: approvalData.notes } };
    } else {
      await prisma.workflowApproval.update({
        where: { id: approvalRecord.id },
        data: { status: 'REJECTED', approvedAt: new Date() }
      });
      return { status: 'FAILED', error: 'Workflow rejected by human' };
    }
  }

  validate(_node: any) {
    return null;
  }
}
