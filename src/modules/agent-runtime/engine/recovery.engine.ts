import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RecoveryEngine {
  public async createCheckpoint(executionId: string, state: any): Promise<string> {
    const checkpoint = await prisma.agentCheckpoint.create({
      data: {
        executionId,
        state: JSON.stringify(state)
      }
    });
    return checkpoint.id;
  }

  public async restoreFromLatestCheckpoint(executionId: string): Promise<any | null> {
    const checkpoint = await prisma.agentCheckpoint.findFirst({
      where: { executionId },
      orderBy: { createdAt: 'desc' }
    });

    if (!checkpoint) return null;

    // Reset status to RUNNING
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: { status: 'RUNNING' }
    });

    return JSON.parse(checkpoint.state);
  }

  public async recoverCrashedExecutions(): Promise<void> {
    // Find RUNNING executions where the heartbeat of the agent is OFFLINE
    // For a real production system, this would be more robust
    const crashedExecutions = await prisma.agentExecution.findMany({
      where: {
        status: 'RUNNING',
        agent: {
          heartbeat: {
            status: 'OFFLINE'
          }
        }
      }
    });

    for (const exec of crashedExecutions) {
      await prisma.agentExecution.update({
        where: { id: exec.id },
        data: { status: 'PAUSED', error: 'Recovered from crash' }
      });
    }
  }
}
