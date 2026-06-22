import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../shared/errors/AppError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token is missing');
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as any;
    
    // Find user with relations to ensure they are still active and exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: true,
        role: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
      throw new AuthenticationError('User account is inactive or not found');
    }

    if (user.organization.status !== 'ACTIVE' || user.organization.deletedAt) {
      throw new AuthenticationError('Organization account is inactive');
    }

    // Attach to request
    const permissions = user.role.permissions.map(p => `${p.resource}:${p.action}`);
    req.user = {
      ...user,
      permissions
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else {
      next(error);
    }
  }
};

export const authorize = (requiredPermissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !req.user.permissions) {
      return next(new AuthenticationError('User not authenticated properly'));
    }

    const hasPermission = requiredPermissions.every(p => req.user!.permissions!.includes(p));
    
    if (!hasPermission) {
      return next(new AuthorizationError('You do not have the required permissions to perform this action'));
    }

    next();
  };
};
