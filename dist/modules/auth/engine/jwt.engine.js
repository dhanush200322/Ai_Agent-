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
exports.JWTEngine = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class JWTEngine {
    async generateAccessToken(payload) {
        // Standard access token (e.g. 15m)
        return jwt.sign(payload, process.env.JWT_SECRET || 'enterprise-secret', { expiresIn: '15m' });
    }
    async generateRefreshToken(sessionId) {
        const token = crypto.randomBytes(64).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        await prisma.refreshToken.create({
            data: {
                sessionId,
                tokenHash,
                expiresAt,
                isRevoked: false
            }
        });
        return token;
    }
    async verifyAccessToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET || 'enterprise-secret');
    }
    async rotateRefreshToken(oldToken, sessionId) {
        const oldTokenHash = crypto.createHash('sha256').update(oldToken).digest('hex');
        const existing = await prisma.refreshToken.findUnique({ where: { tokenHash: oldTokenHash } });
        if (!existing || existing.isRevoked || existing.sessionId !== sessionId) {
            // Refresh token replay detected or invalid token
            return null;
        }
        if (new Date(existing.expiresAt) < new Date()) {
            return null;
        }
        // Revoke the old token
        await prisma.refreshToken.update({
            where: { id: existing.id },
            data: { isRevoked: true }
        });
        // Generate a new one
        const newToken = await this.generateRefreshToken(sessionId);
        // Link replacement to trace rotation
        const newTokenHash = crypto.createHash('sha256').update(newToken).digest('hex');
        await prisma.refreshToken.update({
            where: { id: existing.id },
            data: { replacedByToken: newTokenHash }
        });
        return newToken;
    }
}
exports.JWTEngine = JWTEngine;
