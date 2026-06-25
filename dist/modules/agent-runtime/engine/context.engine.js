"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextEngine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ContextEngine {
    async getContext(agentId, key) {
        const context = await prisma.agentContext.findUnique({
            where: { agentId_key: { agentId, key } }
        });
        return context ? JSON.parse(context.value) : null;
    }
    async setContext(agentId, key, value) {
        await prisma.agentContext.upsert({
            where: { agentId_key: { agentId, key } },
            update: { value: JSON.stringify(value) },
            create: { agentId, key, value: JSON.stringify(value) }
        });
    }
    async deleteContext(agentId, key) {
        await prisma.agentContext.delete({
            where: { agentId_key: { agentId, key } }
        });
    }
    async getAllContext(agentId) {
        const contexts = await prisma.agentContext.findMany({ where: { agentId } });
        const result = {};
        for (const ctx of contexts) {
            result[ctx.key] = JSON.parse(ctx.value);
        }
        return result;
    }
}
exports.ContextEngine = ContextEngine;
