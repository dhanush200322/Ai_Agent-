import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';
import { CorrelationEngine } from './CorrelationEngine';
import { ObservabilityConfig } from './ObservabilityConfig';

@Injectable()
export class LoggingEngine implements LoggerService {
  private readonly logger: pino.Logger;

  constructor(
    private readonly correlationEngine: CorrelationEngine,
    private readonly config: ObservabilityConfig,
  ) {
    this.logger = pino({
      level: this.config.isDevelopment ? 'debug' : 'info',
      transport: this.config.isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
            },
          }
        : undefined,
      base: {
        serviceName: this.config.serviceName,
      },
    });
  }

  private enrichContext(context?: string) {
    const correlation = this.correlationEngine.getContext();
    return {
      context,
      requestId: correlation?.requestId,
      traceId: this.correlationEngine.getTraceId(),
      spanId: this.correlationEngine.getSpanId(),
      correlationId: correlation?.correlationId,
      organizationId: correlation?.organizationId,
      userId: correlation?.userId,
      timestamp: new Date().toISOString(),
    };
  }

  log(message: any, context?: string) {
    this.logger.info(this.enrichContext(context), message);
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error({ ...this.enrichContext(context), trace }, message);
  }

  warn(message: any, context?: string) {
    this.logger.warn(this.enrichContext(context), message);
  }

  debug(message: any, context?: string) {
    this.logger.debug(this.enrichContext(context), message);
  }

  verbose(message: any, context?: string) {
    this.logger.trace(this.enrichContext(context), message);
  }
}
