import { prisma } from '../../../shared/prisma';
import { PrismaClient, AgentExecutionStatus } from '@prisma/client';
import { AgentExecutionInput, AgentExecutionResult } from '../types/runtime.types';



export class RuntimeEngine {
  public async spawn(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const execution = await prisma.agentExecution.create({
      data: {
        organizationId: input.organizationId,
        agentId: input.agentId,
        sessionId: input.sessionId,
        goal: input.goal,
        status: 'PENDING'
      }
    });

    if (input.variables) {
      for (const [key, value] of Object.entries(input.variables)) {
        await prisma.agentContext.upsert({
          where: { agentId_key: { agentId: input.agentId, key } },
          update: { value: JSON.stringify(value) },
          create: { agentId: input.agentId, key, value: JSON.stringify(value) }
        });
      }
    }

    return {
      executionId: execution.id,
      status: execution.status
    };
  }

  public async pause(executionId: string): Promise<void> {
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: { status: 'PAUSED' }
    });
  }

  public async resume(executionId: string): Promise<void> {
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: { status: 'RUNNING' }
    });
  }

  public async cancel(executionId: string): Promise<void> {
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: { status: 'CANCELED', finishedAt: new Date() }
    });
  }

  public async terminate(executionId: string, error?: string): Promise<void> {
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: { status: 'FAILED', error, finishedAt: new Date() }
    });
  }
}
