import { PrismaClient, AgentTask } from '@prisma/client';

const prisma = new PrismaClient();

export class TaskService {
  async createTask(teamId: string, input: string, priority: number = 0, parentTaskId?: string): Promise<AgentTask> {
    return prisma.agentTask.create({
      data: {
        teamId,
        input,
        priority,
        parentTaskId,
        status: 'PENDING'
      }
    });
  }

  async assignTask(taskId: string, agentId: string): Promise<AgentTask> {
    return prisma.agentTask.update({
      where: { id: taskId },
      data: { assignedAgentId: agentId, status: 'WAITING' }
    });
  }

  async startTask(taskId: string): Promise<AgentTask> {
    return prisma.agentTask.update({
      where: { id: taskId },
      data: { status: 'RUNNING', startedAt: new Date() }
    });
  }

  async completeTask(taskId: string, output: string): Promise<AgentTask> {
    return prisma.agentTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', output, completedAt: new Date() }
    });
  }

  async failTask(taskId: string, error: string): Promise<AgentTask> {
    return prisma.agentTask.update({
      where: { id: taskId },
      data: { status: 'FAILED', output: error, completedAt: new Date() }
    });
  }

  async getSubTasks(parentTaskId: string) {
    return prisma.agentTask.findMany({
      where: { parentTaskId },
      orderBy: { createdAt: 'asc' }
    });
  }
}
