import { Injectable, Logger } from '@nestjs/common';
import { TelemetryEngine } from '../engine/TelemetryEngine';
import { MetricsEngine } from '../engine/MetricsEngine';

@Injectable()
export class TelemetryWorker {
  private readonly logger = new Logger(TelemetryWorker.name);

  constructor(
    private readonly telemetryEngine: TelemetryEngine,
    private readonly metricsEngine: MetricsEngine
  ) {}

  async processTelemetryBatch(events: any[]) {
    this.logger.debug(`Processing telemetry batch of ${events.length} events`);
    for (const event of events) {
      this.telemetryEngine.trackEvent(event);
      this.metricsEngine.incrementCounter('telemetry_events_processed_total', { category: event.category });
    }
  }
}
