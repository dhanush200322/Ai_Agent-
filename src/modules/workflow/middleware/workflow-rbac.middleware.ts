import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthorizationError, NotFoundError } from '../../../shared/errors/AppError';

const prisma = new PrismaClient();

export const authorizeWorkflow = (action: 'read' | 'write' | 'execute' | 'delete') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new AuthorizationError('Authentication required.');
      }

      const userOrgId = user.organizationId;
      const { id: workflowId } = req.params;

      // 1. Evaluate general permissions mapping
      const requiredPermission = `workflow:${action}`;
      const hasPermission = user.permissions.includes(requiredPermission) || 
                            user.permissions.includes('workflow:admin') ||
                            user.role?.name === 'Owner' || 
                            user.role?.name === 'Admin';

      if (!hasPermission) {
        throw new AuthorizationError(`You do not have the required permission: ${requiredPermission}`);
      }

      // 2. If a workflowId is present in params, enforce tenant isolation
      if (workflowId) {
        const workflow = await prisma.workflow.findUnique({
          where: { id: workflowId }
        });

        if (!workflow) {
          throw new NotFoundError('Workflow not found');
        }

        if (workflow.organizationId !== userOrgId) {
          throw new AuthorizationError('Cross-tenant workflow access is denied.');
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
