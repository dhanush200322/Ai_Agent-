import { Injectable, Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

@Injectable()
export class CircuitBreakerEngine {
  private readonly logger = new Logger(CircuitBreakerEngine.name);
  private states = new Map<string, { state: CircuitState, failures: number, nextAttempt: number }>();

  async execute<T>(serviceName: string, action: () => Promise<T>, threshold: number = 5, timeoutMs: number = 30000): Promise<T> {
    const record = this.states.get(serviceName) || { state: CircuitState.CLOSED, failures: 0, nextAttempt: 0 };

    if (record.state === CircuitState.OPEN) {
      if (Date.now() < record.nextAttempt) {
        throw new Error(`Circuit for ${serviceName} is OPEN`);
      }
      record.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await action();
      if (record.state === CircuitState.HALF_OPEN) {
        record.state = CircuitState.CLOSED;
        record.failures = 0;
      }
      this.states.set(serviceName, record);
      return result;
    } catch (err) {
      record.failures++;
      if (record.failures >= threshold) {
        record.state = CircuitState.OPEN;
        record.nextAttempt = Date.now() + timeoutMs;
        this.logger.warn(`Circuit Breaker TRIPPED for ${serviceName}`);
      }
      this.states.set(serviceName, record);
      throw err;
    }
  }
}
