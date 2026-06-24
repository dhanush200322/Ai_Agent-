import { WorkflowSchedule } from '@prisma/client';
import { prisma } from '../prisma';
import { QueueManager } from '../../queue/engine/queue-manager';
import { BullMQProvider } from '../../queue/providers/bullmq.provider';
const queueProvider = new BullMQProvider();
const queueManager = new QueueManager(queueProvider);

export class SchedulerEngine {
  
  /**
   * Registers a workflow cron schedule.
   */
  async registerSchedule(
    workflowId: string,
    cron: string,
    timezone = 'UTC'
  ): Promise<WorkflowSchedule> {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });
    if (!workflow) throw new Error('Workflow not found');

    // 1. Save schedule to Database
    const schedule = await prisma.workflowSchedule.create({
      data: {
        workflowId,
        cron,
        timezone,
        enabled: true
      }
    });

    // 2. Register Repeatable Job in BullMQ
    await queueProvider.enqueue({
      queueName: 'scheduler',
      type: 'WORKFLOW',
      payload: {
        id: schedule.id,
        organizationId: workflow.organizationId,
        correlationId: workflowId,
        traceId: workflowId,
        priority: 'NORMAL',
        retries: 0,
        payload: {
          workflowId,
          scheduleId: schedule.id,
          timezone
        },
        metadata: {},
        createdAt: new Date()
      },
      repeat: {
        pattern: cron
      }
    });

    return schedule;
  }

  /**
   * Disables a schedule and removes it from queue repeat jobs.
   */
  async disableSchedule(scheduleId: string): Promise<void> {
    await prisma.workflowSchedule.update({
      where: { id: scheduleId },
      data: { enabled: false }
    });

    // Clean repeatable job
    await queueProvider.removeJob('scheduler', scheduleId);
  }

  /**
   * Triggers a delayed workflow execution.
   */
  async scheduleDelayedExecution(
    workflowId: string,
    delayMs: number,
    variables: Record<string, any> = {}
  ): Promise<string> {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });
    if (!workflow) throw new Error('Workflow not found');

    // Enqueue a delayed execution job
    const jobId = await queueManager.enqueue({
      queueName: 'workflow',
      type: 'WORKFLOW',
      delayMs,
      payload: {
        id: Math.random().toString(),
        organizationId: workflow.organizationId,
        correlationId: workflowId,
        traceId: workflowId,
        priority: 'NORMAL',
        retries: 0,
        payload: {
          workflowId,
          variables
        },
        metadata: {},
        createdAt: new Date()
      }
    });

    return jobId;
  }
}
