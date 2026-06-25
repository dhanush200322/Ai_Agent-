"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const client_1 = require("@prisma/client");
const redis_1 = require("../../../config/redis");
const redis_constants_1 = require("../../../config/redis.constants");
const crypto = __importStar(require("crypto"));
const prisma = new client_1.PrismaClient();
class SessionService {
    get redis() {
        return redis_1.RedisConnectionManager.getClient();
    }
    async createSession(userId, ipAddress, userAgent, deviceId) {
        const sessionId = crypto.randomUUID();
        const tokenFingerprint = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days timeout
        // Create in DB
        const session = await prisma.userSession.create({
            data: {
                id: sessionId,
                userId,
                deviceId,
                tokenFingerprint,
                ipAddress: ipAddress || 'unknown',
                userAgent: userAgent || 'unknown',
                expiresAt,
                status: 'ACTIVE'
            }
        });
        // Create in Redis
        const cacheKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.SESSION}${sessionId}`;
        await this.redis.setex(cacheKey, redis_constants_1.REDIS_CONSTANTS.TTL.SESSION * 7, JSON.stringify(session));
        return session;
    }
    async getSession(sessionId) {
        const cacheKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.SESSION}${sessionId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const session = await prisma.userSession.findUnique({ where: { id: sessionId } });
        if (session) {
            await this.redis.setex(cacheKey, redis_constants_1.REDIS_CONSTANTS.TTL.SESSION * 7, JSON.stringify(session));
        }
        return session;
    }
    async revokeSession(sessionId) {
        // Revoke in DB
        await prisma.userSession.update({
            where: { id: sessionId },
            data: { status: 'REVOKED' }
        });
        // Remove from Redis
        const cacheKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.SESSION}${sessionId}`;
        await this.redis.del(cacheKey);
    }
    async revokeAllUserSessions(userId) {
        const sessions = await prisma.userSession.findMany({ where: { userId, status: 'ACTIVE' } });
        for (const s of sessions) {
            await this.revokeSession(s.id);
        }
    }
    async listActiveSessions(userId) {
        return prisma.userSession.findMany({ where: { userId, status: 'ACTIVE' } });
    }
    async validateSession(sessionId) {
        const session = await this.getSession(sessionId);
        if (!session || session.status !== 'ACTIVE' || new Date(session.expiresAt) < new Date()) {
            return false;
        }
        // Update last activity (Sliding Expiration)
        await this.updateActivity(sessionId);
        return true;
    }
    async updateActivity(sessionId) {
        const cacheKey = `${redis_constants_1.REDIS_CONSTANTS.NAMESPACES.SESSION}${sessionId}`;
        await this.redis.expire(cacheKey, redis_constants_1.REDIS_CONSTANTS.TTL.SESSION * 7);
        await prisma.userSession.update({
            where: { id: sessionId },
            data: { lastActivityAt: new Date() }
        });
    }
}
exports.SessionService = SessionService;
