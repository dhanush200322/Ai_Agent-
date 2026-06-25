"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis_1 = require("../../config/redis");
class PubSubService {
    subscriberClient = null;
    subscriptions = new Map();
    get publisherClient() {
        return redis_1.RedisConnectionManager.getClient();
    }
    async publish(channel, message) {
        const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
        return await this.publisherClient.publish(channel, stringMessage);
    }
    async subscribe(channel, callback) {
        if (!this.subscriberClient) {
            // Create a dedicated subscriber client using the shared options
            const options = redis_1.RedisConnectionManager.getConnectionOptions();
            const url = process.env.REDIS_URL;
            this.subscriberClient = url ? new ioredis_1.default(url, options) : new ioredis_1.default(options);
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
    async unsubscribe(channel) {
        if (this.subscriberClient) {
            await this.subscriberClient.unsubscribe(channel);
            this.subscriptions.delete(channel);
        }
    }
    async disconnect() {
        if (this.subscriberClient) {
            await this.subscriberClient.quit();
            this.subscriberClient = null;
        }
    }
}
exports.PubSubService = PubSubService;
