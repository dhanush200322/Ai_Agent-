export class MetricsService {
  private metrics: Record<string, number | string> = {};
  private startTimes: Record<string, number> = {};
  private globalStartTime: number = Date.now();

  startTimer(label: string) {
    this.startTimes[label] = Date.now();
  }

  stopTimer(label: string) {
    if (this.startTimes[label]) {
      this.metrics[label] = Date.now() - this.startTimes[label];
      delete this.startTimes[label];
    }
  }

  setMetric(label: string, value: number | string) {
    this.metrics[label] = value;
  }

  getMetrics() {
    this.metrics['Total Time'] = Date.now() - this.globalStartTime;
    return this.metrics;
  }

  logMetrics(requestId: string) {
    const finalMetrics = this.getMetrics();
    console.log(`[${requestId}] [MetricsService] Performance Report:`);
    Object.entries(finalMetrics).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}${key.includes('Count') ? '' : 'ms'}`);
    });
  }
}
