"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const AppError_1 = require("../shared/errors/AppError");
const jwt_engine_1 = require("../modules/auth/engine/jwt.engine");
const session_service_1 = require("../modules/auth/services/session.service");
const policy_engine_1 = require("../modules/auth/engine/policy.engine");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const jwtEngine = new jwt_engine_1.JWTEngine();
const sessionService = new session_service_1.SessionService();
const policyEngine = new policy_engine_1.PolicyEngine();
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError_1.AuthenticationError('Access token is missing');
        }
        const token = authHeader.split(' ')[1];
        // 1. JWT Validation (Signature & Expiration)
        const decoded = await jwtEngine.verifyAccessToken(token);
        const { userId, sessionId, organizationId } = decoded;
        // 2. Redis Session Validation
        const isSessionValid = await sessionService.validateSession(sessionId);
        if (!isSessionValid) {
            throw new AppError_1.AuthenticationError('Session is invalid or expired');
        }
        // 3. Load User & Organization Validation
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: true,
                role: { include: { permissions: true } }
            }
        });
        if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
            throw new AppError_1.AuthenticationError('User account is inactive or not found');
        }
        if (user.organizationId !== organizationId || user.organization.status !== 'ACTIVE' || user.organization.deletedAt) {
            throw new AppError_1.AuthenticationError('Organization is inactive or mismatch');
        }
        // 4. Policy Engine Evaluation (Zero Trust context)
        const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
        const isAllowedByPolicy = await policyEngine.evaluateAuthenticationPolicy(organizationId, ipAddress);
        if (!isAllowedByPolicy) {
            throw new AppError_1.AuthenticationError('Access denied by organization policy');
        }
        // Attach to request
        const permissions = user.role?.permissions?.map((p) => `${p.resource}:${p.action}`) || [];
        req.user = {
            ...user,
            permissions
        };
        req.sessionId = sessionId;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            next(new AppError_1.AuthenticationError('Token expired'));
        }
        else if (error.name === 'JsonWebTokenError') {
            next(new AppError_1.AuthenticationError('Invalid token'));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
const authorize = (requiredPermissions) => {
    return (req, _res, next) => {
        const user = req.user;
        if (!user || !user.permissions) {
            return next(new AppError_1.AuthenticationError('User not authenticated properly'));
        }
        const hasPermission = requiredPermissions.every(p => user.permissions.includes(p));
        if (!hasPermission) {
            return next(new AppError_1.AuthorizationError('You do not have the required permissions to perform this action'));
        }
        next();
    };
};
exports.authorize = authorize;
