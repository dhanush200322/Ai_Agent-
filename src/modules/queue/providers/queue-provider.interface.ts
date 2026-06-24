export type JobType = 'CHAT' | 'WORKFLOW' | 'TOOL' | 'PLUGIN' | 'MULTI_AGENT' | 'EMAIL' | 'NOTIFICATION' | 'EMBEDDING' | 'WEBHOOK';
export type JobPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
import { JobPayloadContract } from '../types';

export interface EnqueueOptions {
  queueName: string;
  type: JobType;
  payload: JobPayloadContract;
  priority?: JobPriority;
  delayMs?: number;
  attempts?: number;
  backoff?: { type: string; delay: number };
  repeat?: { pattern: string }; // cron
}

export interface QueueJob {
  id: string;
  name: string;
  payload: JobPayloadContract;
  attemptsMade: number;
  updateProgress(progress: number): Promise<void>;
  log(message: string): Promise<void>;
}

export interface QueueProvider {
  enqueue(options: EnqueueOptions): Promise<string>;
  pause(queueName: string): Promise<void>;
  resume(queueName: string): Promise<void>;
  drain(queueName: string): Promise<void>;
  clean(queueName: string, grace: number, status: string): Promise<void>;
  removeJob(queueName: string, jobId: string): Promise<void>;
  getMetrics(queueName: string): Promise<any>;
  registerWorker(queueName: string, concurrency: number, processor: (job: QueueJob) => Promise<void>): void;
  disconnect(): Promise<void>;
}
