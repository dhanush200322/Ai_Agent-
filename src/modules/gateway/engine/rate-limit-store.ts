export interface RateLimitStore {
  /**
   * Increments the count for a key and returns the current count.
   * Abstracted so MemoryStore or RedisStore can be injected.
   */
  increment(key: string, windowSeconds: number): Promise<number>;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number, resetAt: number }>();

  async increment(key: string, windowSeconds: number): Promise<number> {
    const now = Date.now();
    let record = this.store.get(key);

    if (!record || record.resetAt < now) {
      record = { count: 0, resetAt: now + (windowSeconds * 1000) };
    }

    record.count++;
    this.store.set(key, record);
    return record.count;
  }
}
