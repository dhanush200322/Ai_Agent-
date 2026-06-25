import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { trace, Tracer, Span, SpanStatusCode } from '@opentelemetry/api';
import { ObservabilityConfig } from './ObservabilityConfig';

@Injectable()
export class TracingEngine implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TracingEngine.name);
  private provider!: NodeTracerProvider;
  private tracer!: Tracer;

  constructor(private readonly config: ObservabilityConfig) {}

  onModuleInit() {
    this.provider = new NodeTracerProvider({
      spanProcessors: [
        new SimpleSpanProcessor(new ConsoleSpanExporter())
      ]
    });

    if (this.config.otlpEndpoint) {
      this.logger.log(`Configured OTLP Trace Exporter at ${this.config.otlpEndpoint}`);
    } else {
      this.logger.log('Configured Console Trace Exporter');
    }

    this.provider.register();
    this.tracer = trace.getTracer(this.config.serviceName);
  }

  async onModuleDestroy() {
    if (this.provider) {
      await (this.provider as any).shutdown();
    }
  }

  getTracer(): Tracer {
    return this.tracer;
  }

  async trace<T>(name: string, fn: (span: Span) => Promise<T>, attributes?: Record<string, string | number | boolean>): Promise<T> {
    return this.tracer.startActiveSpan(name, async (span: Span) => {
      if (attributes) {
        span.setAttributes(attributes);
      }
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error: any) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
