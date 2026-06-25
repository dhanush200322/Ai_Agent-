import { Request, Response } from 'express';
import { AuthenticationEngine } from '../engine/authentication.engine';
import { SessionService } from '../services/session.service';
import { MFAEngine } from '../engine/mfa.engine';
import { ApiResponse } from '../../../shared/response/ApiResponse';
import { Queue } from 'bullmq';
import { RedisConnectionManager } from '../../../config/redis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthController {
  private authEngine = new AuthenticationEngine();
  private sessionService = new SessionService();
  private mfaEngine = new MFAEngine();
  
  private get authQueue() {
    return new Queue('auth-events', { connection: RedisConnectionManager.getClient() as any });
  }
  private get auditQueue() {
    return new Queue('audit-events', { connection: RedisConnectionManager.getClient() as any });
  }

  login = async (req: Request, res: Response) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    try {
      const result = await this.authEngine.login(req.body, ip, userAgent as string);
      
      if (result.requireMfa) {
        res.status(202).json(ApiResponse.success(result, 'MFA required', req.reqId));
        return;
      }

      await this.authQueue.add('login', { userId: result.user.id, ip, userAgent });
      await this.auditQueue.add('audit', { action: 'LOGIN', userId: result.user.id });

      res.status(200).json(ApiResponse.success(result, 'Login successful', req.reqId));
    } catch (e: any) {
      res.status(401).json(ApiResponse.error(e.message, 'Authentication failed', req.reqId));
    }
  };

  logout = async (req: Request, res: Response) => {
    const sessionId = req.sessionId;
    if (sessionId) {
      await this.authEngine.logout(sessionId);
      await this.authQueue.add('logout', { sessionId });
      await this.auditQueue.add('audit', { action: 'LOGOUT', sessionId });
    }
    res.status(200).json(ApiResponse.success(null, 'Logout successful', req.reqId));
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const { refreshToken, sessionId } = req.body;
      const result = await this.authEngine.refresh(refreshToken, sessionId);
      await this.authQueue.add('refresh', { sessionId });
      res.status(200).json(ApiResponse.success(result, 'Token refreshed successfully', req.reqId));
    } catch (e: any) {
      res.status(401).json(ApiResponse.error('Invalid refresh token', 'Authentication failed', req.reqId));
    }
  };

  passwordReset = async (req: Request, res: Response) => {
    const { email } = req.body;
    await this.authQueue.add('password-reset', { email });
    res.status(200).json(ApiResponse.success(null, 'Password reset initiated', req.reqId));
  };

  passwordChange = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await this.authQueue.add('password-change', { userId });
    await this.auditQueue.add('audit', { action: 'PASSWORD_CHANGE', userId });
    res.status(200).json(ApiResponse.success(null, 'Password changed successfully', req.reqId));
  };

  mfaSetup = async (req: Request, res: Response) => {
    const user = req.user!;
    const { secret, qrCodeUrl } = await this.mfaEngine.generateSecret(user.email!);
    res.status(200).json(ApiResponse.success({ secret, qrCodeUrl }, 'MFA Setup initialized', req.reqId));
  };

  mfaVerify = async (req: Request, res: Response) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const { userId, token } = req.body;

    try {
      const result = await this.authEngine.verifyMfaChallenge(userId, token, ip, userAgent as string);
      await this.authQueue.add('login', { userId, ip, userAgent, mfa: true });
      res.status(200).json(ApiResponse.success(result, 'MFA Verification successful', req.reqId));
    } catch (e: any) {
      res.status(401).json(ApiResponse.error(e.message, 'MFA Verification failed', req.reqId));
    }
  };

  mfaDisable = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await prisma.userMFA.updateMany({ where: { userId }, data: { isEnabled: false } });
    await this.authQueue.add('mfa-disabled', { userId });
    await this.auditQueue.add('audit', { action: 'MFA_DISABLED', userId });
    res.status(200).json(ApiResponse.success(null, 'MFA Disabled', req.reqId));
  };

  getSessions = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sessions = await this.sessionService.listActiveSessions(userId);
    res.status(200).json(ApiResponse.success(sessions, 'Sessions retrieved', req.reqId));
  };

  revokeSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.sessionService.revokeSession(id);
    await this.authQueue.add('session-revoked', { sessionId: id });
    res.status(200).json(ApiResponse.success(null, 'Session revoked', req.reqId));
  };

  revokeAllSessions = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await this.sessionService.revokeAllUserSessions(userId);
    res.status(200).json(ApiResponse.success(null, 'All sessions revoked', req.reqId));
  };

  oauthGoogle = async (req: Request, res: Response) => {
    res.status(200).json(ApiResponse.success({ url: 'https://accounts.google.com/o/oauth2/v2/auth' }, 'Google OAuth initialized', req.reqId));
  };

  oauthMicrosoft = async (req: Request, res: Response) => {
    res.status(200).json(ApiResponse.success({ url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize' }, 'Microsoft OAuth initialized', req.reqId));
  };
}
