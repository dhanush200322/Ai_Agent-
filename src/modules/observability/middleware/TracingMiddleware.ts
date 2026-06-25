import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CorrelationEngine } from '../engine/CorrelationEngine';
import { PerformanceEngine } from '../engine/PerformanceEngine';
import { TracingEngine } from '../engine/TracingEngine';
import { TelemetryEngine } from '../engine/TelemetryEngine';
import { SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class TracingMiddleware implements NestMiddleware {
  constructor(
    private readonly correlationEngine: CorrelationEngine,
    private readonly performanceEngine: PerformanceEngine,
    private readonly tracingEngine: TracingEngine,
    private readonly telemetryEngine: TelemetryEngine,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || undefined;
    const correlationId = (req.headers['x-correlation-id'] as string) || undefined;
    const organizationId = (req.headers['x-organization-id'] as string) || undefined;

    this.correlationEngine.run({ requestId, correlationId, organizationId }, () => {
      const tracer = this.tracingEngine.getTracer();
      const startTime = Date.now();

      tracer.startActiveSpan(`${req.method} ${req.path}`, (span) => {
        span.setAttributes({
          'http.method': req.method,
          'http.url': req.url,
          'http.route': req.path,
          'http.user_agent': req.headers['user-agent'] || '',
        });

        res.on('finish', () => {
          const duration = Date.now() - startTime;
          span.setAttribute('http.status_code', res.statusCode);
          
          if (res.statusCode >= 400) {
            span.setStatus({ code: SpanStatusCode.ERROR });
            this.performanceEngine.trackErrorRate('API', req.path);
          } else {
            span.setStatus({ code: SpanStatusCode.OK });
          }

          this.performanceEngine.trackLatency('API', req.path, duration);
          this.performanceEngine.trackThroughput('API', req.path);

          this.telemetryEngine.trackEvent({
            name: 'http_request_completed',
            category: 'api',
            attributes: {
              path: req.path,
              method: req.method,
              statusCode: res.statusCode,
              durationMs: duration
            }
          });

          span.end();
        });

        next();
      });
    });
  }
}
