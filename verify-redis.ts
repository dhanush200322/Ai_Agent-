import { RedisConnectionManager } from './src/config/redis';
import { CacheService } from './src/modules/cache/cache.service';
import { LockService } from './src/modules/cache/lock.service';
import { PubSubService } from './src/modules/cache/pubsub.service';
import { RedisHealthService } from './src/modules/observability/services/redis-health.service';

async function verifyRedis() {
  console.log("Starting Redis Infrastructure Validation...");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
      console.log(`✅ ${message}`);
    } else {
      failed++;
      console.error(`❌ FAILED: ${message}`);
    }
  }

  try {
    // 1. Singleton Connection Manager
    const client1 = RedisConnectionManager.getClient();
    const client2 = RedisConnectionManager.getClient();
    assert(client1 === client2, "RedisConnectionManager returns a true singleton client");
    assert(RedisConnectionManager.isConnected(), "Redis connection state is reported as connected");
    
    const pingRes = await RedisConnectionManager.ping();
    assert(pingRes === 'PONG', "Redis client responds to raw ping");

    // 2. Health Service
    const healthService = new RedisHealthService();
    const isHealthy = await healthService.ping();
    assert(isHealthy, "RedisHealthService ping returns true");
    const memUsage = await healthService.getMemoryUsage();
    assert(memUsage !== 'Unknown', `RedisHealthService retrieved memory usage: ${memUsage}`);

    // 3. Cache Service
    const cache = new CacheService();
    await cache.set('test:key', { msg: 'hello' }, 10);
    const cachedData = await cache.get<{ msg: string }>('test:key');
    assert(cachedData?.msg === 'hello', "CacheService set/get workflow successful");
    
    await cache.del('test:counter');
    await cache.increment('test:counter', 5);
    const counterVal = await cache.get<number>('test:counter');
    assert(counterVal === 5, "CacheService increment workflow successful");
    
    await cache.del('test:key');
    const exists = await cache.exists('test:key');
    assert(!exists, "CacheService delete workflow successful");

    // 4. Lock Service
    const locker = new LockService();
    const lockToken = await locker.acquire('my-task');
    assert(lockToken !== null, "LockService successfully acquired a distributed lock");
    
    const lockToken2 = await locker.acquire('my-task');
    assert(lockToken2 === null, "LockService correctly prevented duplicate lock acquisition");

    const released = await locker.release('my-task', lockToken!);
    assert(released, "LockService successfully released the lock securely");

    // 5. PubSub Service
    const pubsub = new PubSubService();
    let receivedMessage = '';
    await pubsub.subscribe('test-channel', (msg) => { receivedMessage = msg; });
    
    await pubsub.publish('test-channel', 'Hello Event Driven Architecture');
    
    // Wait briefly for pubsub delivery
    await new Promise(r => setTimeout(r, 100));
    assert(receivedMessage === 'Hello Event Driven Architecture', "PubSubService successfully published and received a message");
    
    await pubsub.unsubscribe('test-channel');
    await pubsub.disconnect();

    // Summary
    console.log(`\n✅ Redis Validation Complete: ${passed} passed, ${failed} failed`);

    if (failed > 0) process.exit(1);
    
  } catch (error) {
    console.error("Critical error during Redis validation suite:", error);
    process.exit(1);
  } finally {
    // 6. Graceful Shutdown
    await RedisConnectionManager.disconnect();
    console.log("Redis singleton gracefully disconnected.");
  }
}

verifyRedis();
