import { Injectable } from '@nestjs/common';
import { MetricsEngine } from './MetricsEngine';

@Injectable()
export class SLOEngine {
  constructor(private readonly metrics: MetricsEngine) {}

  recordRequest(service: string, success: boolean, latencyMs: number) {
    this.metrics.incrementCounter('slo_requests_total', { service });
    if (success) {
      this.metrics.incrementCounter('slo_requests_success', { service });
    } else {
      this.metrics.incrementCounter('slo_requests_error', { service });
      this.metrics.incrementCounter('slo_error_budget_burn', { service }, 1);
    }
    this.metrics.observeHistogram('slo_request_latency', { service }, latencyMs);
  }

  recordUptime(service: string, isUp: boolean) {
    this.metrics.setGauge('slo_uptime_status', { service }, isUp ? 1 : 0);
  }
}
