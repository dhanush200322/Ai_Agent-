export const REDIS_CONSTANTS = {
  DEFAULT_PORT: 6379,
  DEFAULT_HOST: 'localhost',
  DEFAULT_DB: 0,
  DEFAULT_TIMEOUT: 5000,
  MAX_RETRIES: 5,
  RETRY_STRATEGY_DELAY: 1000, // ms base delay
  TTL: {
    SESSION: 86400, // 24 hours
    CACHE_SHORT: 300, // 5 minutes
    CACHE_LONG: 3600, // 1 hour
    LOCK_DEFAULT: 30000, // 30 seconds
  },
  NAMESPACES: {
    AGENT: 'agent:',
    WORKFLOW: 'workflow:',
    CHAT: 'chat:',
    CACHE: 'cache:',
    SESSION: 'session:',
    BILLING: 'billing:',
    QUOTA: 'quota:',
    LOCK: 'lock:',
    QUEUE: 'queue:',
    PLUGIN: 'plugin:',
    MEMORY: 'memory:',
    VAULT: 'vault:'
  }
};
