"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisHealthService = void 0;
const redis_1 = require("../../../config/redis");
class RedisHealthService {
    get client() {
        return redis_1.RedisConnectionManager.getClient();
    }
    async ping() {
        try {
            const response = await this.client.ping();
            return response === 'PONG';
        }
        catch {
            return false;
        }
    }
    async getInfo() {
        try {
            const info = await this.client.info();
            return this.parseInfo(info);
        }
        catch {
            return {};
        }
    }
    async getMemoryUsage() {
        const info = await this.getInfo();
        return info['used_memory_human'] || 'Unknown';
    }
    async getConnectedClients() {
        const info = await this.getInfo();
        return parseInt(info['connected_clients'] || '0', 10);
    }
    async getUptime() {
        const info = await this.getInfo();
        return parseInt(info['uptime_in_seconds'] || '0', 10);
    }
    parseInfo(infoStr) {
        const lines = infoStr.split('\r\n');
        const result = {};
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
exports.RedisHealthService = RedisHealthService;
