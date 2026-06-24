export class RetryEngine {
  calculateBackoff(attempt: number, baseDelayMs: number = 1000, factor: number = 2): number {
    return baseDelayMs * Math.pow(factor, attempt);
  }
}
