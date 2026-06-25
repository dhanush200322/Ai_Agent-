import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { trace, context as otelContext } from '@opentelemetry/api';
import { randomUUID } from 'crypto';

export interface CorrelationContext {
  requestId: string;
  correlationId: string;
  organizationId?: string;
  userId?: string;
}

@Injectable()
export class CorrelationEngine {
  private readonly als = new AsyncLocalStorage<CorrelationContext>();

  run<R>(context: Partial<CorrelationContext>, callback: () => R): R {
    const fullContext: CorrelationContext = {
      requestId: context.requestId || randomUUID(),
      correlationId: context.correlationId || randomUUID(),
      organizationId: context.organizationId,
      userId: context.userId,
    };
    return this.als.run(fullContext, callback);
  }

  getContext(): CorrelationContext | undefined {
    return this.als.getStore();
  }

  getRequestId(): string | undefined {
    return this.getContext()?.requestId;
  }

  getCorrelationId(): string | undefined {
    return this.getContext()?.correlationId;
  }

  getOrganizationId(): string | undefined {
    return this.getContext()?.organizationId;
  }

  getUserId(): string | undefined {
    return this.getContext()?.userId;
  }

  getTraceId(): string | undefined {
    const spanContext = trace.getSpanContext(otelContext.active());
    return spanContext?.traceId;
  }

  getSpanId(): string | undefined {
    const spanContext = trace.getSpanContext(otelContext.active());
    return spanContext?.spanId;
  }
}
