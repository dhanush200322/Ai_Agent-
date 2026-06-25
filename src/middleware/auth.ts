import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from '../shared/errors/AppError';
import { JWTEngine } from '../modules/auth/engine/jwt.engine';
import { SessionService } from '../modules/auth/services/session.service';
import { PolicyEngine } from '../modules/auth/engine/policy.engine';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const jwtEngine = new JWTEngine();
const sessionService = new SessionService();
const policyEngine = new PolicyEngine();

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token is missing');
    }

    const token = authHeader.split(' ')[1];
    
    // 1. JWT Validation (Signature & Expiration)
    const decoded = await jwtEngine.verifyAccessToken(token);
    const { userId, sessionId, organizationId } = decoded;

    // 2. Redis Session Validation
    const isSessionValid = await sessionService.validateSession(sessionId);
    if (!isSessionValid) {
      throw new AuthenticationError('Session is invalid or expired');
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
      throw new AuthenticationError('User account is inactive or not found');
    }

    if (user.organizationId !== organizationId || user.organization.status !== 'ACTIVE' || user.organization.deletedAt) {
      throw new AuthenticationError('Organization is inactive or mismatch');
    }

    // 4. Policy Engine Evaluation (Zero Trust context)
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const isAllowedByPolicy = await policyEngine.evaluateAuthenticationPolicy(organizationId, ipAddress);
    if (!isAllowedByPolicy) {
      throw new AuthenticationError('Access denied by organization policy');
    }

    // Attach to request
    const permissions = user.role?.permissions?.map((p: any) => `${p.resource}:${p.action}`) || [];
    req.user = {
      ...user,
      permissions
    };
    req.sessionId = sessionId;

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'));
    } else {
      next(error);
    }
  }
};

export const authorize = (requiredPermissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.permissions) {
      return next(new AuthenticationError('User not authenticated properly'));
    }

    const hasPermission = requiredPermissions.every(p => user.permissions!.includes(p));
    
    if (!hasPermission) {
      return next(new AuthorizationError('You do not have the required permissions to perform this action'));
    }

    next();
  };
};

