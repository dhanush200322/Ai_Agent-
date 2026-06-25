import { Injectable } from '@nestjs/common';
import { MetricsEngine } from './MetricsEngine';

@Injectable()
export class PerformanceEngine {
  constructor(private readonly metrics: MetricsEngine) {}

  trackLatency(component: string, operation: string, durationMs: number) {
    this.metrics.observeHistogram('operation_latency_ms', { component, operation }, durationMs);
  }

  trackThroughput(component: string, operation: string) {
    this.metrics.incrementCounter('operation_throughput_total', { component, operation });
  }

  trackErrorRate(component: string, operation: string) {
    this.metrics.incrementCounter('operation_errors_total', { component, operation });
  }
}
