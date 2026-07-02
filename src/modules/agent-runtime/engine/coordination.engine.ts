import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class CoordinationEngine {
  public async delegateTask(sourceAgentId: string, targetAgentId: string, taskDefinition: string): Promise<string> {
    const delegation = await prisma.agentDelegation.create({
      data: {
        sourceAgentId,
        targetAgentId,
        taskDefinition,
        status: 'PENDING'
      }
    });

    await prisma.agentEvent.create({
      data: {
        agentId: sourceAgentId,
        type: 'DELEGATION',
        payload: JSON.stringify({ action: 'DELEGATE_OUT', delegationId: delegation.id, targetAgentId })
      }
    });

    return delegation.id;
  }

  public async resolveDelegation(delegationId: string, status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'FAILED', result?: string): Promise<void> {
    await prisma.agentDelegation.update({
      where: { id: delegationId },
      data: { status, result }
    });
  }

  public async sendMessage(senderId: string, receiverId: string, content: string): Promise<void> {
    await prisma.agentMessage.create({
      data: {
        senderAgentId: senderId,
        receiverAgentId: receiverId,
        content,
        type: 'UPDATE'
      }
    });
  }
}
