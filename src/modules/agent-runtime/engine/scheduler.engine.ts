import { prisma } from '../../../shared/prisma';
import { PrismaClient, JobType } from '@prisma/client';



export class SchedulerEngine {
  public async scheduleExecution(organizationId: string, executionId: string, delayMs: number): Promise<void> {
    await prisma.scheduledJob.create({
      data: {
        organizationId,
        queue: 'agent-runtime',
        type: JobType.AGENT_RUNTIME,
        payload: JSON.stringify({ executionId }),
        intervalMs: delayMs,
        oneTime: true,
        nextRunAt: new Date(Date.now() + delayMs)
      }
    });
  }

  public async scheduleCron(organizationId: string, agentId: string, cronExpression: string, goal: string): Promise<void> {
    await prisma.scheduledJob.create({
      data: {
        organizationId,
        queue: 'agent-runtime',
        type: JobType.AGENT_RUNTIME,
        payload: JSON.stringify({ agentId, goal }),
        cronExpression,
        oneTime: false,
        nextRunAt: new Date() // Ideally calculate next tick based on cron
      }
    });
  }
}
