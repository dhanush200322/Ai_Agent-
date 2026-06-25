"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyEngine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PolicyEngine {
    async evaluateAuthenticationPolicy(organizationId, ipAddress) {
        const policy = await prisma.authenticationPolicy.findUnique({
            where: { organizationId },
            include: { ipRanges: true, geoRestrictions: true, workingHours: true }
        });
        if (!policy)
            return true; // Allow by default
        if (policy.enforceIpRestriction && policy.ipRanges.length > 0) {
            const allowed = policy.ipRanges.some(r => r.type === 'ALLOWLIST' && r.cidr === ipAddress);
            if (!allowed)
                return false;
        }
        return true;
    }
    async validatePasswordComplexity(organizationId, password) {
        const policy = await prisma.authenticationPolicy.findUnique({ where: { organizationId } });
        if (!policy)
            return password.length >= 8;
        if (password.length < policy.passwordMinLength)
            return false;
        if (policy.passwordRequireNum && !/\d/.test(password))
            return false;
        if (policy.passwordRequireUpper && !/[A-Z]/.test(password))
            return false;
        if (policy.passwordRequireSym && !/[!@#$%^&*]/.test(password))
            return false;
        return true;
    }
    async isMfaRequired(organizationId, userId, isAdmin = false) {
        const policy = await prisma.authenticationPolicy.findUnique({ where: { organizationId } });
        if (!policy)
            return false;
        if (policy.mfaEnforcementLevel === 'REQUIRED_FOR_ALL')
            return true;
        if (policy.mfaEnforcementLevel === 'REQUIRED_FOR_ADMINS' && isAdmin)
            return true;
        return policy.requireMfa;
    }
}
exports.PolicyEngine = PolicyEngine;
