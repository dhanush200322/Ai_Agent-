import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  correlationId?: string;
}

export class TracingService {
  /**
   * Starts a new span. If context is provided, it acts as a child span.
   */
  startSpan(_module: string, _operation: string, parentContext?: TraceContext, correlationId?: string): TraceContext {
    const traceId = parentContext?.traceId || uuidv4();
    const spanId = uuidv4();
    
    return {
      traceId,
      spanId,
      parentSpanId: parentContext?.spanId,
      correlationId: correlationId || parentContext?.correlationId
    };
  }

  /**
   * Ends a span and writes it asynchronously.
   */
  endSpan(context: TraceContext, module: string, operation: string, durationMs: number, status: 'OK' | 'ERROR', attributes?: any, events?: any, organizationId?: string) {
    prisma.trace.create({
      data: {
        traceId: context.traceId,
        spanId: context.spanId,
        parentSpanId: context.parentSpanId,
        correlationId: context.correlationId,
        module,
        operation,
        duration: durationMs,
        status,
        attributes: attributes ? JSON.stringify(attributes) : null,
        events: events ? JSON.stringify(events) : null,
        organizationId
      }
    }).catch(err => {
      console.error(`[TracingService] Failed to record span ${context.spanId}:`, err);
    });
  }
}
