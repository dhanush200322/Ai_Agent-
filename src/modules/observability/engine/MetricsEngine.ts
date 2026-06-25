import { Injectable, OnModuleInit } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsEngine implements OnModuleInit {
  private readonly registry = new promClient.Registry();

  private counters = new Map<string, promClient.Counter<string>>();
  private gauges = new Map<string, promClient.Gauge<string>>();
  private histograms = new Map<string, promClient.Histogram<string>>();

  onModuleInit() {
    promClient.collectDefaultMetrics({ register: this.registry });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getCounter(name: string, help: string, labelNames: string[] = []): promClient.Counter<string> {
    if (!this.counters.has(name)) {
      const counter = new promClient.Counter({
        name,
        help,
        labelNames,
        registers: [this.registry],
      });
      this.counters.set(name, counter);
    }
    return this.counters.get(name)!;
  }

  getGauge(name: string, help: string, labelNames: string[] = []): promClient.Gauge<string> {
    if (!this.gauges.has(name)) {
      const gauge = new promClient.Gauge({
        name,
        help,
        labelNames,
        registers: [this.registry],
      });
      this.gauges.set(name, gauge);
    }
    return this.gauges.get(name)!;
  }

  getHistogram(name: string, help: string, labelNames: string[] = []): promClient.Histogram<string> {
    if (!this.histograms.has(name)) {
      const histogram = new promClient.Histogram({
        name,
        help,
        labelNames,
        registers: [this.registry],
      });
      this.histograms.set(name, histogram);
    }
    return this.histograms.get(name)!;
  }

  incrementCounter(name: string, labels: Record<string, string | number> = {}, value = 1) {
    const counter = this.getCounter(name, `Counter for ${name}`);
    counter.inc(labels, value);
  }

  setGauge(name: string, labels: Record<string, string | number> = {}, value: number) {
    const gauge = this.getGauge(name, `Gauge for ${name}`);
    gauge.set(labels, value);
  }

  observeHistogram(name: string, labels: Record<string, string | number> = {}, value: number) {
    const histogram = this.getHistogram(name, `Histogram for ${name}`);
    histogram.observe(labels, value);
  }
}
