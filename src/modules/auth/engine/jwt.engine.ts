import { prisma } from '../../../shared/prisma';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';



export class JWTEngine {
  async generateAccessToken(payload: any): Promise<string> {
    // Standard access token (e.g. 15m)
    return jwt.sign(payload, process.env.JWT_SECRET || 'enterprise-secret', { expiresIn: '15m' });
  }

  async generateRefreshToken(sessionId: string): Promise<string> {
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

  async verifyAccessToken(token: string): Promise<any> {
    return jwt.verify(token, process.env.JWT_SECRET || 'enterprise-secret');
  }

  async rotateRefreshToken(oldToken: string, sessionId: string): Promise<string | null> {
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
