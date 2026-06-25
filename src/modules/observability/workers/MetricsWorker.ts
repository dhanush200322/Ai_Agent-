import { Injectable, Logger } from '@nestjs/common';
import { MetricsEngine } from '../engine/MetricsEngine';

@Injectable()
export class MetricsWorker {
  private readonly logger = new Logger(MetricsWorker.name);

  constructor(private readonly metricsEngine: MetricsEngine) {
    this.startPeriodicSync();
  }

  private startPeriodicSync() {
    setInterval(() => {
      this.logger.debug('Syncing metrics to persistence (if enabled)');
      // In a real environment, Prometheus scrapes /metrics.
      // If pushing is needed (e.g., Pushgateway), we'd implement that here.
    }, 60000);
  }
}
