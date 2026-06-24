export interface MetricStorageInterface {
  recordMetric(organizationId: string | null, module: string, metricName: string, value: number, tags?: Record<string, string>): Promise<void>;
  getMetrics(module: string, metricName: string, startTime: Date, endTime: Date): Promise<any[]>;
  purgeOldMetrics(retentionDays: number): Promise<number>;
}
