import { prisma } from '../../../shared/prisma';
import { Request, Response } from 'express';
import { AuthenticationEngine } from '../engine/authentication.engine';
import { SessionService } from '../services/session.service';
import { AuthService } from '../services/auth.service';
import { MFAEngine } from '../engine/mfa.engine';
import { ApiResponse } from '../../../shared/response/ApiResponse';
import { Queue } from 'bullmq';
import { RedisConnectionManager } from '../../../config/redis';
import { PrismaClient } from '@prisma/client';



export class AuthController {
  private authEngine = new AuthenticationEngine();
  private authService = new AuthService();
  private sessionService = new SessionService();
  private mfaEngine = new MFAEngine();
  
  private get authQueue() {
    return new Queue('auth-events', { connection: RedisConnectionManager.getClient() as any });
  }
  private get auditQueue() {
    return new Queue('audit-events', { connection: RedisConnectionManager.getClient() as any });
  }

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.register(req.body);
      
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      await this.authQueue.add('login', { userId: result.user.id, ip, userAgent });
      await this.auditQueue.add('audit', { action: 'REGISTER', userId: result.user.id });

      res.status(201).json(ApiResponse.success(result, 'Registration successful', req.reqId));
    } catch (e: any) {
      if (e.name === 'ConflictError') {
        res.status(409).json(ApiResponse.error(e.message, 'Registration failed', req.reqId));
      } else {
        res.status(400).json(ApiResponse.error(e.message, 'Registration failed', req.reqId));
      }
    }
  };

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

  me = async (req: Request, res: Response) => {
    const user = await this.authService.me(req.user!.id);
    res.status(200).json(ApiResponse.success(user, 'User fetched successfully', req.reqId));
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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/oauth/google/callback`;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&access_type=offline&prompt=consent`;
    res.redirect(url);
  };

  oauthGoogleCallback = async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }

    try {
      const axios = require('axios');
      // Exchange code for token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/oauth/google/callback`,
        grant_type: 'authorization_code',
      });

      const { access_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { email, given_name, family_name } = profileResponse.data;

      let user = await prisma.user.findUnique({ where: { email } });
      
      // If user doesn't exist, auto-register them
      if (!user) {
        // Generate a random password since they use Google
        const randomPassword = Math.random().toString(36).slice(-8) + 'A1!'; 
        const orgName = `${given_name || 'User'}'s Workspace`;
        const orgSlug = orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') + '-' + Math.floor(Math.random() * 1000);
        
        const registerResult = await this.authService.register({
          organizationName: orgName,
          organizationSlug: orgSlug,
          firstName: given_name || 'Google',
          lastName: family_name || 'User',
          email,
          password: randomPassword
        });
        
        user = await prisma.user.findUnique({ where: { id: registerResult.user.id } });
      }

      // Log the user in
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // Note: For OAuth, we bypass MFA (or we could enforce it if required)
      const session = await this.sessionService.createSession(user!.id, ip, userAgent);
      
      // Using JWTEngine to generate standard tokens
      const { JWTEngine } = require('../engine/jwt.engine');
      const jwtEngine = new JWTEngine();
      const accessToken = await jwtEngine.generateAccessToken({ userId: user!.id, sessionId: session.id, organizationId: user!.organizationId });
      const refreshToken = await jwtEngine.generateRefreshToken(session.id);
      
      await this.authQueue.add('login', { userId: user!.id, ip, userAgent, method: 'google' });
      await this.auditQueue.add('audit', { action: 'LOGIN_OAUTH_GOOGLE', userId: user!.id });

      // Redirect back to frontend with tokens
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&sessionId=${session.id}&provider=google`);
    } catch (e: any) {
      console.error("Google OAuth Error:", e.response?.data || e.message);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  };

  oauthGithub = async (req: Request, res: Response) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/oauth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    res.redirect(url);
  };

  oauthGithubCallback = async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }

    try {
      const axios = require('axios');
      // Exchange code for token
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/oauth/github/callback`
      }, {
        headers: { Accept: 'application/json' }
      });

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        throw new Error("No access token received from GitHub");
      }

      // Get user profile
      const profileResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      
      // GitHub doesn't always return the email in the main profile object if it's private
      let email = profileResponse.data.email;
      const { name, login } = profileResponse.data;

      // If email is null, fetch emails array
      if (!email) {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const primaryEmailObj = emailsResponse.data.find((e: any) => e.primary);
        email = primaryEmailObj ? primaryEmailObj.email : emailsResponse.data[0].email;
      }

      let user = await prisma.user.findUnique({ where: { email } });
      
      // If user doesn't exist, auto-register them
      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-8) + 'A1!'; 
        const displayName = name || login || 'GitHub User';
        const nameParts = displayName.split(' ');
        const given_name = nameParts[0];
        const family_name = nameParts.slice(1).join(' ') || 'User';

        const orgName = `${given_name}'s Workspace`;
        const orgSlug = orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') + '-' + Math.floor(Math.random() * 1000);
        
        const registerResult = await this.authService.register({
          organizationName: orgName,
          organizationSlug: orgSlug,
          firstName: given_name,
          lastName: family_name,
          email,
          password: randomPassword
        });
        
        user = await prisma.user.findUnique({ where: { id: registerResult.user.id } });
      }

      // Log the user in
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      const session = await this.sessionService.createSession(user!.id, ip, userAgent);
      
      const { JWTEngine } = require('../engine/jwt.engine');
      const jwtEngine = new JWTEngine();
      const accessToken = await jwtEngine.generateAccessToken({ userId: user!.id, sessionId: session.id, organizationId: user!.organizationId });
      const refreshToken = await jwtEngine.generateRefreshToken(session.id);
      
      await this.authQueue.add('login', { userId: user!.id, ip, userAgent, method: 'github' });
      await this.auditQueue.add('audit', { action: 'LOGIN_OAUTH_GITHUB', userId: user!.id });

      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&sessionId=${session.id}&provider=github`);
    } catch (e: any) {
      console.error("GitHub OAuth Error:", e.response?.data || e.message);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  };
}
