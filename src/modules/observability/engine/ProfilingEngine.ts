import { prisma } from '../../../shared/prisma';
import { Injectable, Logger } from '@nestjs/common';
import * as v8 from 'v8';
import * as perfHooks from 'perf_hooks';
import { PrismaClient } from '@prisma/client';
import { MetricsEngine } from './MetricsEngine';

@Injectable()
export class ProfilingEngine {
  private readonly logger = new Logger(ProfilingEngine.name);
  private readonly prisma = prisma;

  constructor(private readonly metrics: MetricsEngine) {
    this.monitorEventLoop();
    this.monitorGC();
  }

  private monitorEventLoop() {
    const histogram = perfHooks.monitorEventLoopDelay({ resolution: 10 });
    histogram.enable();

    setInterval(() => {
      const delay = histogram.mean / 1e6; // Convert to ms
      this.metrics.setGauge('nodejs_eventloop_delay_ms', {}, delay);
      
      if (delay > 100) {
        this.logger.warn(`High Event Loop Delay: ${delay.toFixed(2)}ms`);
        this.saveProfile('EVENT_LOOP', { meanDelayMs: delay });
      }
    }, 5000);
  }

  private monitorGC() {
    const obs = new perfHooks.PerformanceObserver((list) => {
      const entry = list.getEntries()[0];
      const kind = (entry as any).detail ? (entry as any).detail.kind : 0;
      this.metrics.observeHistogram('nodejs_gc_duration_seconds', { kind }, entry.duration / 1000);
    });
    obs.observe({ entryTypes: ['gc'] });
  }

  async captureHeapSnapshot() {
    const stats = v8.getHeapStatistics();
    this.metrics.setGauge('nodejs_heap_used_bytes', {}, stats.used_heap_size);
    this.metrics.setGauge('nodejs_heap_total_bytes', {}, stats.total_heap_size);
    
    await this.saveProfile('MEMORY', stats);
  }

  async checkForMemoryLeaks() {
    const stats = v8.getHeapStatistics();
    const usageRatio = stats.used_heap_size / stats.heap_size_limit;
    
    if (usageRatio > 0.85) {
      this.logger.error(`Possible memory leak detected. Heap usage at ${(usageRatio * 100).toFixed(1)}%`);
      await this.saveProfile('MEMORY_LEAK_WARNING', stats);
    }
  }

  private async saveProfile(type: string, data: any) {
    await this.prisma.performanceProfile.create({
      data: {
        type,
        snapshotData: JSON.stringify(data)
      }
    });
  }
}
