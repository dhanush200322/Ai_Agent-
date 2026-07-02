import { prisma } from '../../../shared/prisma';
import { PrismaClient, AgentMessage } from '@prisma/client';



export class MessageBusService {
  async send(senderAgentId: string, receiverAgentId: string, content: string, type: any = 'REQUEST', taskId?: string, metadata?: any): Promise<AgentMessage> {
    return prisma.agentMessage.create({
      data: {
        senderAgentId,
        receiverAgentId,
        content,
        type,
        taskId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  }

  async broadcast(senderAgentId: string, teamId: string, content: string, type: any = 'UPDATE', taskId?: string, metadata?: any) {
    const team = await prisma.agentTeam.findUnique({ where: { id: teamId }, include: { members: true } });
    if (!team) throw new Error('Team not found');

    const messages = team.members
      .filter(m => m.agentId !== senderAgentId)
      .map(m => ({
        senderAgentId,
        receiverAgentId: m.agentId,
        content,
        type,
        taskId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }));

    if (messages.length > 0) {
      await prisma.agentMessage.createMany({ data: messages });
    }
  }

  async getMessagesForAgent(agentId: string) {
    return prisma.agentMessage.findMany({
      where: { receiverAgentId: agentId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getTaskMessages(taskId: string) {
    return prisma.agentMessage.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' }
    });
  }
}
