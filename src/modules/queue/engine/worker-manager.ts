import { PrismaClient, WorkerStatus } from '@prisma/client';
import { QueueProvider, QueueJob } from '../providers/queue-provider.interface';
import * as os from 'os';

const prisma = new PrismaClient();

export class WorkerManager {
  private hostname: string;
  private isShuttingDown: boolean = false;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(
    private provider: QueueProvider,
    private capabilities: string[] = ['*']
  ) {
    this.hostname = `${os.hostname()}-${process.pid}`;
    this.setupGracefulShutdown();
  }

  async start(concurrency: number = 10) {
    console.log(`Starting WorkerManager on node ${this.hostname}`);
    
    await (prisma as any).workerNode.upsert({
      where: { hostname: this.hostname },
      update: { status: WorkerStatus.ONLINE, lastHeartbeat: new Date(), concurrency, capabilities: JSON.stringify(this.capabilities) },
      create: { hostname: this.hostname, status: WorkerStatus.ONLINE, concurrency, capabilities: JSON.stringify(this.capabilities) }
    });

    this.startHeartbeat();
  }

  registerWorker(queueName: string, concurrency: number, processor: (job: QueueJob) => Promise<void>) {
    // Middleware injection happens in the dispatcher, but WorkerManager delegates the raw BullMQ worker registration to the provider.
    this.provider.registerWorker(queueName, concurrency, processor);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      if (this.isShuttingDown) return;
      try {
        await (prisma as any).workerNode.update({
          where: { hostname: this.hostname },
          data: { lastHeartbeat: new Date() }
        });
      } catch (err) {
        console.error('Failed to update worker heartbeat', err);
      }
    }, 15000); // 15 seconds
  }

  private setupGracefulShutdown() {
    const shutdown = async () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      console.log(`\nSIGINT received. Initiating graceful shutdown for ${this.hostname}...`);

      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

      // Stop accepting jobs & finish current
      await this.provider.disconnect();

      // Update Node status
      try {
        await (prisma as any).workerNode.update({
          where: { hostname: this.hostname },
          data: { status: WorkerStatus.OFFLINE, lastHeartbeat: new Date() }
        });
      } catch (e) {}

      console.log(`WorkerNode ${this.hostname} successfully shut down.`);
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}

