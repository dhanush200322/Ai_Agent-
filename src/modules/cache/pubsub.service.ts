import Redis from 'ioredis';
import { RedisConnectionManager } from '../../config/redis';

export class PubSubService {
  private subscriberClient: Redis | null = null;
  private subscriptions: Map<string, (message: string) => void> = new Map();

  private get publisherClient() {
    return RedisConnectionManager.getClient();
  }

  async publish(channel: string, message: any): Promise<number> {
    const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
    return await this.publisherClient.publish(channel, stringMessage);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    if (!this.subscriberClient) {
      // Create a dedicated subscriber client using the shared options
      const options = RedisConnectionManager.getConnectionOptions();
      const url = process.env.REDIS_URL;
      this.subscriberClient = url ? new Redis(url, options) : new Redis(options);
      
      this.subscriberClient.on('message', (chan, msg) => {
        const handler = this.subscriptions.get(chan);
        if (handler) {
          handler(msg);
        }
      });
    }

    await this.subscriberClient.subscribe(channel);
    this.subscriptions.set(channel, callback);
  }

  async unsubscribe(channel: string): Promise<void> {
    if (this.subscriberClient) {
      await this.subscriberClient.unsubscribe(channel);
      this.subscriptions.delete(channel);
    }
  }

  async disconnect(): Promise<void> {
    if (this.subscriberClient) {
      await this.subscriberClient.quit();
      this.subscriberClient = null;
    }
  }
}
