"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyEngine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PolicyEngine {
    async validateExecution(organizationId, agentId) {
        const policy = await prisma.agentPolicy.findFirst({
            where: { organizationId }
        });
        if (!policy)
            return true; // No policy means allowed
        const rules = JSON.parse(policy.rules);
        // Evaluate rules (e.g. max cost, forbidden models)
        if (rules.forbiddenModels && rules.forbiddenModels.includes('some-model')) {
            return false;
        }
        return true;
    }
}
exports.PolicyEngine = PolicyEngine;
