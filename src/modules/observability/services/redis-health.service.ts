import { RedisConnectionManager } from '../../../config/redis';

export class RedisHealthService {
  private get client() {
    return RedisConnectionManager.getClient();
  }

  async ping(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response === 'PONG';
    } catch {
      return false;
    }
  }

  async getInfo(): Promise<Record<string, string>> {
    try {
      const info = await this.client.info();
      return this.parseInfo(info);
    } catch {
      return {};
    }
  }

  async getMemoryUsage(): Promise<string> {
    const info = await this.getInfo();
    return info['used_memory_human'] || 'Unknown';
  }

  async getConnectedClients(): Promise<number> {
    const info = await this.getInfo();
    return parseInt(info['connected_clients'] || '0', 10);
  }

  async getUptime(): Promise<number> {
    const info = await this.getInfo();
    return parseInt(info['uptime_in_seconds'] || '0', 10);
  }

  private parseInfo(infoStr: string): Record<string, string> {
    const lines = infoStr.split('\r\n');
    const result: Record<string, string> = {};
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          result[key.trim()] = value.trim();
        }
      }
    }
    return result;
  }
}
