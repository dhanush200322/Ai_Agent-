import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { RedisConnectionManager } from '../../../config/redis';
import { QueueProvider, EnqueueOptions, QueueJob } from './queue-provider.interface';


export class BullMQProvider implements QueueProvider {
  private connection: Redis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queueEvents: Map<string, QueueEvents> = new Map();

  constructor() {
    this.connection = RedisConnectionManager.getClient() as any;
  }

  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, { connection: this.connection as any });
      this.queues.set(queueName, queue);
      
      const events = new QueueEvents(queueName, { connection: this.connection as any });
      this.queueEvents.set(queueName, events);
    }
    return this.queues.get(queueName)!;
  }

  async enqueue(options: EnqueueOptions): Promise<string> {
    const queue = this.getQueue(options.queueName);
    
    // Map JobPriority enum to BullMQ priority (lower number = higher priority)
    // CRITICAL=1, HIGH=2, NORMAL=3, LOW=4
    let bullPriority = 3;
    if (options.priority === 'CRITICAL') bullPriority = 1;
    if (options.priority === 'HIGH') bullPriority = 2;
    if (options.priority === 'LOW') bullPriority = 4;

    const job = await queue.add(options.type, options.payload, {
      delay: options.delayMs,
      priority: bullPriority,
      attempts: options.attempts || 3,
      backoff: options.backoff ? {
        type: options.backoff.type.toLowerCase(),
        delay: options.backoff.delay
      } : undefined,
      repeat: options.repeat,
      jobId: options.payload.id // enforce our correlation ID
    });

    return job.id!;
  }

  async pause(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
  }

  async resume(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
  }

  async drain(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.drain();
  }

  async clean(queueName: string, grace: number, status: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 1000, status as any);
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) await job.remove();
  }

  async getMetrics(queueName: string): Promise<any> {
    const queue = this.getQueue(queueName);
    const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
    return counts;
  }

  registerWorker(queueName: string, concurrency: number, processor: (job: QueueJob) => Promise<void>): void {
    const worker = new Worker(queueName, async (job: Job) => {
      const queueJob: QueueJob = {
        id: job.id!,
        name: job.name,
        payload: job.data,
        attemptsMade: job.attemptsMade,
        updateProgress: async (progress: number) => { await job.updateProgress(progress); },
        log: async (message: string) => { await job.log(message); }
      };
      await processor(queueJob);
    }, { 
      connection: RedisConnectionManager.getConnectionOptions() as any,
      concurrency
    });

    this.workers.set(`${queueName}-${Date.now()}`, worker);
  }

  async disconnect(): Promise<void> {
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    for (const events of this.queueEvents.values()) {
      await events.close();
    }
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    this.connection.disconnect();
  }
}

