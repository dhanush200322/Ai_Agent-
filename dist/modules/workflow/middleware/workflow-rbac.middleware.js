"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeWorkflow = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../../shared/errors/AppError");
const prisma = new client_1.PrismaClient();
const authorizeWorkflow = (action) => {
    return async (req, _res, next) => {
        try {
            const user = req.user;
            if (!user) {
                throw new AppError_1.AuthorizationError('Authentication required.');
            }
            const userOrgId = user.organizationId;
            const { id: workflowId } = req.params;
            // 1. Evaluate general permissions mapping
            const requiredPermission = `workflow:${action}`;
            const hasPermission = user.permissions?.includes(requiredPermission) ||
                user.permissions?.includes('workflow:admin') ||
                user.role?.name === 'Owner' ||
                user.role?.name === 'Admin';
            if (!hasPermission) {
                throw new AppError_1.AuthorizationError(`You do not have the required permission: ${requiredPermission}`);
            }
            // 2. If a workflowId is present in params, enforce tenant isolation
            if (workflowId) {
                const workflow = await prisma.workflow.findUnique({
                    where: { id: workflowId }
                });
                if (!workflow) {
                    throw new AppError_1.NotFoundError('Workflow not found');
                }
                if (workflow.organizationId !== userOrgId) {
                    throw new AppError_1.AuthorizationError('Cross-tenant workflow access is denied.');
                }
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.authorizeWorkflow = authorizeWorkflow;
