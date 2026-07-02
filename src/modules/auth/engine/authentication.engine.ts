import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PolicyEngine } from './policy.engine';
import { RiskEngine } from './risk.engine';
import { MFAEngine } from './mfa.engine';
import { SessionService } from '../services/session.service';
import { JWTEngine } from './jwt.engine';



export class AuthenticationEngine {
  private policyEngine = new PolicyEngine();
  private riskEngine = new RiskEngine();
  private mfaEngine = new MFAEngine();
  private sessionService = new SessionService();
  private jwtEngine = new JWTEngine();

  async login(credentials: any, ipAddress: string, userAgent: string): Promise<any> {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { role: true }
    });
    if (!user) throw new Error('Invalid credentials');

    if (user.status !== 'ACTIVE') throw new Error('Account is not active');

    // 1. Password Validation
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Record failed login
      await prisma.loginHistory.create({
        data: { userId: user.id, eventType: 'LOGIN_FAILED', status: 'FAILED', ipAddress, userAgent, failureReason: 'Invalid password' }
      });
      throw new Error('Invalid credentials');
    }

    // 2. Policy Engine
    const allowed = await this.policyEngine.evaluateAuthenticationPolicy(user.organizationId, ipAddress);
    if (!allowed) throw new Error('Login rejected by organization policy');

    // 3. Risk Engine
    const riskScore = await this.riskEngine.evaluateSessionRisk(user.id, ipAddress, userAgent);
    
    // 4. MFA Validation (Temporarily disabled for direct dashboard access)
    // const isMfaRequired = await this.policyEngine.isMfaRequired(user.organizationId, user.id, user.role?.name === 'Admin');
    // if (isMfaRequired || riskScore > 50) {
    //   // Require MFA challenge flow instead of full login
    //   return { requireMfa: true, userId: user.id };
    // }

    // Record success
    await prisma.loginHistory.create({
      data: { userId: user.id, eventType: 'LOGIN_SUCCESS', status: 'SUCCESS', ipAddress, userAgent, riskScore }
    });

    // 5. Session Service
    const session = await this.sessionService.createSession(user.id, ipAddress, userAgent);

    // 6. JWT Engine
    const accessToken = await this.jwtEngine.generateAccessToken({ userId: user.id, sessionId: session.id, organizationId: user.organizationId });
    const refreshToken = await this.jwtEngine.generateRefreshToken(session.id);

    return { accessToken, refreshToken, user };
  }

  async verifyMfaChallenge(userId: string, token: string, ipAddress: string, userAgent: string): Promise<any> {
    const userMfa = await prisma.userMFA.findFirst({ where: { userId, type: 'TOTP', isEnabled: true } });
    if (!userMfa || !userMfa.secret) throw new Error('MFA not configured');

    const isValid = await this.mfaEngine.verifyToken(userMfa.secret, token);
    if (!isValid) throw new Error('Invalid MFA token');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const session = await this.sessionService.createSession(userId, ipAddress, userAgent);
    const accessToken = await this.jwtEngine.generateAccessToken({ userId: user.id, sessionId: session.id, organizationId: user.organizationId });
    const refreshToken = await this.jwtEngine.generateRefreshToken(session.id);

    return { accessToken, refreshToken, user };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.revokeSession(sessionId);
  }

  async refresh(oldRefreshToken: string, sessionId: string): Promise<any> {
    const newRefreshToken = await this.jwtEngine.rotateRefreshToken(oldRefreshToken, sessionId);
    if (!newRefreshToken) {
      await this.sessionService.revokeSession(sessionId); // Revoke session if replay detected
      throw new Error('Invalid refresh token');
    }

    const session = await this.sessionService.getSession(sessionId);
    if (!session) throw new Error('Invalid session');

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) throw new Error('User not found');

    const accessToken = await this.jwtEngine.generateAccessToken({ userId: user.id, sessionId: session.id, organizationId: user.organizationId });
    
    return { accessToken, refreshToken: newRefreshToken };
  }
}
