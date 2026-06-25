import { Injectable } from '@nestjs/common';
import { LoggingEngine } from './LoggingEngine';
import { CorrelationEngine } from './CorrelationEngine';
import { TracingEngine } from './TracingEngine';
import { SpanStatusCode } from '@opentelemetry/api';

export interface TelemetryEventPayload {
  name: string;
  category: string;
  attributes?: Record<string, string | number | boolean>;
}

@Injectable()
export class TelemetryEngine {
  constructor(
    private readonly logger: LoggingEngine,
    private readonly correlationEngine: CorrelationEngine,
    private readonly tracingEngine: TracingEngine,
  ) {}

  trackEvent(event: TelemetryEventPayload) {
    this.logger.log(`Telemetry Event: ${event.name}`, 'TelemetryEngine');
    
    const tracer = this.tracingEngine.getTracer();
    tracer.startActiveSpan(`event:${event.name}`, (span) => {
      if (event.attributes) {
        span.setAttributes(event.attributes);
      }
      span.addEvent(event.name, event.attributes);
      span.end();
    });
  }

  trackError(error: Error, attributes?: Record<string, string | number | boolean>) {
    this.logger.error(`Telemetry Error: ${error.message}`, error.stack, 'TelemetryEngine');
    
    const tracer = this.tracingEngine.getTracer();
    tracer.startActiveSpan('error_capture', (span) => {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.recordException(error);
      if (attributes) {
        span.setAttributes(attributes);
      }
      span.end();
    });
  }
}
