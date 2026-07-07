"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const policy_engine_1 = require("./policy.engine");
const risk_engine_1 = require("./risk.engine");
const mfa_engine_1 = require("./mfa.engine");
const session_service_1 = require("../services/session.service");
const jwt_engine_1 = require("./jwt.engine");
class AuthenticationEngine {
    policyEngine = new policy_engine_1.PolicyEngine();
    riskEngine = new risk_engine_1.RiskEngine();
    mfaEngine = new mfa_engine_1.MFAEngine();
    sessionService = new session_service_1.SessionService();
    jwtEngine = new jwt_engine_1.JWTEngine();
    async login(credentials, ipAddress, userAgent) {
        const { email, password } = credentials;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });
        if (!user)
            throw new Error('Invalid credentials');
        if (user.status !== 'ACTIVE')
            throw new Error('Account is not active');
        // 1. Password Validation
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            // Record failed login
            await prisma_1.prisma.loginHistory.create({
                data: { userId: user.id, eventType: 'LOGIN_FAILED', status: 'FAILED', ipAddress, userAgent, failureReason: 'Invalid password' }
            });
            throw new Error('Invalid credentials');
        }
        // 2. Policy Engine
        const allowed = await this.policyEngine.evaluateAuthenticationPolicy(user.organizationId, ipAddress);
        if (!allowed)
            throw new Error('Login rejected by organization policy');
        // 3. Risk Engine
        const riskScore = await this.riskEngine.evaluateSessionRisk(user.id, ipAddress, userAgent);
        // 4. MFA Validation (Temporarily disabled for direct dashboard access)
        // const isMfaRequired = await this.policyEngine.isMfaRequired(user.organizationId, user.id, user.role?.name === 'Admin');
        // if (isMfaRequired || riskScore > 50) {
        //   // Require MFA challenge flow instead of full login
        //   return { requireMfa: true, userId: user.id };
        // }
        // Record success
        await prisma_1.prisma.loginHistory.create({
            data: { userId: user.id, eventType: 'LOGIN_SUCCESS', status: 'SUCCESS', ipAddress, userAgent, riskScore }
        });
        // 5. Session Service
        const session = await this.sessionService.createSession(user.id, ipAddress, userAgent);
        // 6. JWT Engine
        const accessToken = await this.jwtEngine.generateAccessToken({ userId: user.id, sessionId: session.id, organizationId: user.organizationId });
        const refreshToken = await this.jwtEngine.generateRefreshToken(session.id);
        return { accessToken, refreshToken, user };
    }
    async verifyMfaChallenge(userId, token, ipAddress, userAgent) {
        const userMfa = await prisma_1.prisma.userMFA.findFirst({ where: { userId, type: 'TOTP', isEnabled: true } });
        if (!userMfa || !userMfa.secret)
            throw new Error('MFA not configured');
        const isValid = await this.mfaEngine.verifyToken(userMfa.secret, token);
        if (!isValid)
            throw new Error('Invalid MFA token');
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const session = await this.sessionService.createSession(userId, ipAddress, userAgent);
        const accessToken = await this.jwtEngine.generateAccessToken({ userId: user.id, sessionId: session.id, organizationId: user.organizationId });
        const refreshToken = await this.jwtEngine.generateRefreshToken(session.id);
        return { accessToken, refreshToken, user };
    }
    async logout(sessionId) {
        await this.sessionService.revokeSession(sessionId);
    }
    async refresh(oldRefreshToken, sessionId) {
        const newRefreshToken = await this.jwtEngine.rotateRefreshToken(oldRefreshToken, sessionId);
        if (!newRefreshToken) {
            await this.sessionService.revokeSession(sessionId); // Revoke session if replay detected
            throw new Error('Invalid refresh token');
        }
        const session = await this.sessionService.getSession(sessionId);
        if (!session)
            throw new Error('Invalid session');
        const user = await prisma_1.prisma.user.findUnique({ where: { id: session.userId } });
        if (!user)
            throw new Error('User not found');
        const accessToken = await this.jwtEngine.generateAccessToken({ userId: user.id, sessionId: session.id, organizationId: user.organizationId });
        return { accessToken, refreshToken: newRefreshToken };
    }
}
exports.AuthenticationEngine = AuthenticationEngine;
