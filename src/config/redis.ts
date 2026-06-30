import Redis, { RedisOptions } from 'ioredis';
import { REDIS_CONSTANTS } from './redis.constants';

export class RedisConnectionManager {
  private static instance: Redis | null = null;
  private static isShuttingDown: boolean = false;

  public static getConnectionOptions(): RedisOptions {
    const url = process.env.REDIS_URL;
    if (url) {
      return {
        maxRetriesPerRequest: null,
        retryStrategy(times) {
          if (times > REDIS_CONSTANTS.MAX_RETRIES) return null;
          return Math.min(times * REDIS_CONSTANTS.RETRY_STRATEGY_DELAY, 3000);
        }
      };
    }

    return {
      host: process.env.REDIS_HOST || REDIS_CONSTANTS.DEFAULT_HOST,
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : REDIS_CONSTANTS.DEFAULT_PORT,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : REDIS_CONSTANTS.DEFAULT_DB,
      maxRetriesPerRequest: null, // Required by BullMQ
      retryStrategy(times) {
        if (times > REDIS_CONSTANTS.MAX_RETRIES) return null;
        return Math.min(times * REDIS_CONSTANTS.RETRY_STRATEGY_DELAY, 3000);
      }
    };
  }

  public static getClient(): Redis {
  if (this.isShuttingDown) {
    throw new Error('RedisConnectionManager is shutting down.');
  }

 if (
  !this.instance ||
  this.instance.status === 'end' ||
  this.instance.status === 'close'
) {
    const url = process.env.REDIS_URL;
    const options = this.getConnectionOptions();

    this.instance = url ? new Redis(url, options) : new Redis(options);

    this.instance.on('connect', () => console.log('[Redis] Connected'));
    this.instance.on('error', (err) => console.error('[Redis] Error:', err));
    this.instance.on('reconnecting', () => console.warn('[Redis] Reconnecting...'));
    this.instance.on('close', () => console.log('[Redis] Connection closed'));

    this.setupGracefulShutdown();
  }

  return this.instance;

}
  public static async ping(): Promise<string> {
    const client = this.getClient();
    return await client.ping();
  }

  public static isConnected(): boolean {
    const status = this.instance?.status;
    return status === 'ready' || status === 'connecting';
  }

  public static async disconnect(): Promise<void> {
    if (this.instance) {
      this.isShuttingDown = true;
      await this.instance.quit();
      this.instance = null;
    }
  }

  private static setupGracefulShutdown() {
    const shutdown = async () => {
      console.log('\n[Redis] SIGINT received. Closing Redis connection...');
      await this.disconnect();
    };

    // Prevent duplicate listeners
    if (process.listenerCount('SIGINT') === 0) {
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    }
  }
}
