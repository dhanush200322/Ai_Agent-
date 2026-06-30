"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConnectionManager = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis_constants_1 = require("./redis.constants");
class RedisConnectionManager {
    static instance = null;
    static isShuttingDown = false;
    static getConnectionOptions() {
        const url = process.env.REDIS_URL;
        if (url) {
            return {
                maxRetriesPerRequest: null,
                retryStrategy(times) {
                    if (times > redis_constants_1.REDIS_CONSTANTS.MAX_RETRIES)
                        return null;
                    return Math.min(times * redis_constants_1.REDIS_CONSTANTS.RETRY_STRATEGY_DELAY, 3000);
                }
            };
        }
        return {
            host: process.env.REDIS_HOST || redis_constants_1.REDIS_CONSTANTS.DEFAULT_HOST,
            port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : redis_constants_1.REDIS_CONSTANTS.DEFAULT_PORT,
            password: process.env.REDIS_PASSWORD || undefined,
            db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : redis_constants_1.REDIS_CONSTANTS.DEFAULT_DB,
            maxRetriesPerRequest: null, // Required by BullMQ
            retryStrategy(times) {
                if (times > redis_constants_1.REDIS_CONSTANTS.MAX_RETRIES)
                    return null;
                return Math.min(times * redis_constants_1.REDIS_CONSTANTS.RETRY_STRATEGY_DELAY, 3000);
            }
        };
    }
    static getClient() {
        if (this.isShuttingDown) {
            throw new Error('RedisConnectionManager is shutting down.');
        }
        if (!this.instance ||
            this.instance.status === 'end' ||
            this.instance.status === 'close') {
            const url = process.env.REDIS_URL;
            const options = this.getConnectionOptions();
            this.instance = url ? new ioredis_1.default(url, options) : new ioredis_1.default(options);
            this.instance.on('connect', () => console.log('[Redis] Connected'));
            this.instance.on('error', (err) => console.error('[Redis] Error:', err));
            this.instance.on('reconnecting', () => console.warn('[Redis] Reconnecting...'));
            this.instance.on('close', () => console.log('[Redis] Connection closed'));
            this.setupGracefulShutdown();
        }
        console.log('================ REDIS DEBUG ================');
        console.log('Redis Status       :', this.instance?.status);
        console.log('Is Shutting Down   :', this.isShuttingDown);
        console.log('Instance Exists    :', !!this.instance);
        console.log('=============================================');
        return this.instance;
    }
    static async ping() {
        const client = this.getClient();
        return await client.ping();
    }
    static isConnected() {
        const status = this.instance?.status;
        return status === 'ready' || status === 'connecting';
    }
    static async disconnect() {
        if (this.instance) {
            this.isShuttingDown = true;
            await this.instance.quit();
            this.instance = null;
        }
    }
    static setupGracefulShutdown() {
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
exports.RedisConnectionManager = RedisConnectionManager;
