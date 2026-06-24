import { RedisConnectionManager } from '../../config/redis';
import { REDIS_CONSTANTS } from '../../config/redis.constants';
import { v4 as uuidv4 } from 'uuid';

export class LockService {
  private get client() {
    return RedisConnectionManager.getClient();
  }

  async acquire(key: string, ttlMs: number = REDIS_CONSTANTS.TTL.LOCK_DEFAULT): Promise<string | null> {
    const lockValue = uuidv4();
    const lockKey = `${REDIS_CONSTANTS.NAMESPACES.LOCK}${key}`;
    const acquired = await this.client.set(lockKey, lockValue, 'PX', ttlMs, 'NX');
    return acquired === 'OK' ? lockValue : null;
  }

  async release(key: string, lockValue: string): Promise<boolean> {
    const lockKey = `${REDIS_CONSTANTS.NAMESPACES.LOCK}${key}`;
    // Lua script ensures we only delete the lock if we own it
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, lockKey, lockValue);
    return result === 1;
  }

  async extend(key: string, lockValue: string, ttlMs: number): Promise<boolean> {
    const lockKey = `${REDIS_CONSTANTS.NAMESPACES.LOCK}${key}`;
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("pexpire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, lockKey, lockValue, ttlMs);
    return result === 1;
  }
}
