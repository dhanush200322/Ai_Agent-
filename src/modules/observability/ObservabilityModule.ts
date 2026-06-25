import { Module, Global, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { 
  ObservabilityConfig, CorrelationEngine, TracingEngine, LoggingEngine, 
  TelemetryEngine, MetricsEngine, SLOEngine, HealthEngine, AlertEngine,
  ProfilingEngine, PerformanceEngine, DashboardEngine, AnalyticsEngine
} from './engine';
import { ObservabilityController } from './controllers/ObservabilityController';
import { TracingMiddleware } from './middleware/TracingMiddleware';

@Global()
@Module({
  controllers: [ObservabilityController],
  providers: [
    ObservabilityConfig,
    CorrelationEngine,
    TracingEngine,
    LoggingEngine,
    TelemetryEngine,
    MetricsEngine,
    SLOEngine,
    HealthEngine,
    AlertEngine,
    ProfilingEngine,
    PerformanceEngine,
    DashboardEngine,
    AnalyticsEngine
  ],
  exports: [
    CorrelationEngine,
    TracingEngine,
    LoggingEngine,
    TelemetryEngine,
    MetricsEngine,
    SLOEngine,
    HealthEngine,
    AlertEngine,
    ProfilingEngine,
    PerformanceEngine,
    DashboardEngine,
    AnalyticsEngine
  ]
})
export class ObservabilityModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TracingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
