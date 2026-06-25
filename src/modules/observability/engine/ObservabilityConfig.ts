import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ObservabilityConfig {
  private readonly logger = new Logger(ObservabilityConfig.name);

  get otlpEndpoint(): string | undefined {
    return process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  }

  get isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  get serviceName(): string {
    return process.env.SERVICE_NAME || 'enterprise-ai-agent';
  }

  get environment(): string {
    return process.env.NODE_ENV || 'development';
  }

  get retentionDays(): number {
    return parseInt(process.env.OBSERVABILITY_RETENTION_DAYS || '30', 10);
  }
}
