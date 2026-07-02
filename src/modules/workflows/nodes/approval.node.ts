import { prisma } from '../../../shared/prisma';
import { BaseWorkflowNode } from './base.node';
import { WorkflowNodeData, NodeExecutionResult } from '../types/workflow.types';
import { WorkflowExecutionContext } from '../engine/context';
import { PrismaClient } from '@prisma/client';



export class ApprovalNode implements BaseWorkflowNode {
  type = 'approval';

  async execute(node: WorkflowNodeData, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    // If we're executing this for the first time, we need to pause the workflow
    // and wait for a human to approve it.
    
    // We create a WorkflowApproval record
    await prisma.workflowApproval.create({
      data: {
        executionId: context.execution.id,
        nodeId: node.id,
        status: 'PENDING'
      }
    });

    return {
      status: 'PAUSED', // Signals the runner to stop executing
      output: { message: 'Waiting for human approval' }
    };
  }

  async resume(node: WorkflowNodeData, context: WorkflowExecutionContext, approvalData?: any): Promise<NodeExecutionResult> {
    // This is called when the API endpoint /approve is hit
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
      // Optionally we could branch to a rejection path if we implemented edge conditions
      return { status: 'FAILED', error: 'Workflow rejected by human' };
    }
  }

  validate(_node: WorkflowNodeData) {
    return null;
  }
}
