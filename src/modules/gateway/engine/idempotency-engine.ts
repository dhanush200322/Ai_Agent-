export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}

export class MemoryCacheStore implements CacheStore {
  private store = new Map<string, { value: string, expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const record = this.store.get(key);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return record.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + (ttlSeconds * 1000) });
  }
}

export class IdempotencyEngine {
  private store: CacheStore;

  constructor(store?: CacheStore) {
    this.store = store || new MemoryCacheStore();
  }

  async checkIdempotency(key: string): Promise<{ isDuplicate: boolean, response?: any }> {
    const cached = await this.store.get(`idemp_${key}`);
    if (cached) {
      return { isDuplicate: true, response: JSON.parse(cached) };
    }
    return { isDuplicate: false };
  }

  async saveResponse(key: string, response: any): Promise<void> {
    await this.store.set(`idemp_${key}`, JSON.stringify(response), 86400); // 24 hours
  }
}
