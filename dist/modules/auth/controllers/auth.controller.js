"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authentication_engine_1 = require("../engine/authentication.engine");
const session_service_1 = require("../services/session.service");
const auth_service_1 = require("../services/auth.service");
const mfa_engine_1 = require("../engine/mfa.engine");
const ApiResponse_1 = require("../../../shared/response/ApiResponse");
const bullmq_1 = require("bullmq");
const redis_1 = require("../../../config/redis");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuthController {
    authEngine = new authentication_engine_1.AuthenticationEngine();
    authService = new auth_service_1.AuthService();
    sessionService = new session_service_1.SessionService();
    mfaEngine = new mfa_engine_1.MFAEngine();
    get authQueue() {
        return new bullmq_1.Queue('auth-events', { connection: redis_1.RedisConnectionManager.getClient() });
    }
    get auditQueue() {
        return new bullmq_1.Queue('audit-events', { connection: redis_1.RedisConnectionManager.getClient() });
    }
    login = async (req, res) => {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        try {
            const result = await this.authEngine.login(req.body, ip, userAgent);
            if (result.requireMfa) {
                res.status(202).json(ApiResponse_1.ApiResponse.success(result, 'MFA required', req.reqId));
                return;
            }
            await this.authQueue.add('login', { userId: result.user.id, ip, userAgent });
            await this.auditQueue.add('audit', { action: 'LOGIN', userId: result.user.id });
            res.status(200).json(ApiResponse_1.ApiResponse.success(result, 'Login successful', req.reqId));
        }
        catch (e) {
            res.status(401).json(ApiResponse_1.ApiResponse.error(e.message, 'Authentication failed', req.reqId));
        }
    };
    logout = async (req, res) => {
        const sessionId = req.sessionId;
        if (sessionId) {
            await this.authEngine.logout(sessionId);
            await this.authQueue.add('logout', { sessionId });
            await this.auditQueue.add('audit', { action: 'LOGOUT', sessionId });
        }
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Logout successful', req.reqId));
    };
    refresh = async (req, res) => {
        try {
            const { refreshToken, sessionId } = req.body;
            const result = await this.authEngine.refresh(refreshToken, sessionId);
            await this.authQueue.add('refresh', { sessionId });
            res.status(200).json(ApiResponse_1.ApiResponse.success(result, 'Token refreshed successfully', req.reqId));
        }
        catch (e) {
            res.status(401).json(ApiResponse_1.ApiResponse.error('Invalid refresh token', 'Authentication failed', req.reqId));
        }
    };
    me = async (req, res) => {
        const user = await this.authService.me(req.user.id);
        res.status(200).json(ApiResponse_1.ApiResponse.success(user, 'User fetched successfully', req.reqId));
    };
    passwordReset = async (req, res) => {
        const { email } = req.body;
        await this.authQueue.add('password-reset', { email });
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Password reset initiated', req.reqId));
    };
    passwordChange = async (req, res) => {
        const userId = req.user.id;
        await this.authQueue.add('password-change', { userId });
        await this.auditQueue.add('audit', { action: 'PASSWORD_CHANGE', userId });
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Password changed successfully', req.reqId));
    };
    mfaSetup = async (req, res) => {
        const user = req.user;
        const { secret, qrCodeUrl } = await this.mfaEngine.generateSecret(user.email);
        res.status(200).json(ApiResponse_1.ApiResponse.success({ secret, qrCodeUrl }, 'MFA Setup initialized', req.reqId));
    };
    mfaVerify = async (req, res) => {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        const { userId, token } = req.body;
        try {
            const result = await this.authEngine.verifyMfaChallenge(userId, token, ip, userAgent);
            await this.authQueue.add('login', { userId, ip, userAgent, mfa: true });
            res.status(200).json(ApiResponse_1.ApiResponse.success(result, 'MFA Verification successful', req.reqId));
        }
        catch (e) {
            res.status(401).json(ApiResponse_1.ApiResponse.error(e.message, 'MFA Verification failed', req.reqId));
        }
    };
    mfaDisable = async (req, res) => {
        const userId = req.user.id;
        await prisma.userMFA.updateMany({ where: { userId }, data: { isEnabled: false } });
        await this.authQueue.add('mfa-disabled', { userId });
        await this.auditQueue.add('audit', { action: 'MFA_DISABLED', userId });
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'MFA Disabled', req.reqId));
    };
    getSessions = async (req, res) => {
        const userId = req.user.id;
        const sessions = await this.sessionService.listActiveSessions(userId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(sessions, 'Sessions retrieved', req.reqId));
    };
    revokeSession = async (req, res) => {
        const { id } = req.params;
        await this.sessionService.revokeSession(id);
        await this.authQueue.add('session-revoked', { sessionId: id });
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Session revoked', req.reqId));
    };
    revokeAllSessions = async (req, res) => {
        const userId = req.user.id;
        await this.sessionService.revokeAllUserSessions(userId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'All sessions revoked', req.reqId));
    };
    oauthGoogle = async (req, res) => {
        res.status(200).json(ApiResponse_1.ApiResponse.success({ url: 'https://accounts.google.com/o/oauth2/v2/auth' }, 'Google OAuth initialized', req.reqId));
    };
    oauthMicrosoft = async (req, res) => {
        res.status(200).json(ApiResponse_1.ApiResponse.success({ url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize' }, 'Microsoft OAuth initialized', req.reqId));
    };
}
exports.AuthController = AuthController;
