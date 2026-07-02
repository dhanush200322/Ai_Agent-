"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
class RegistryEngine {
    async registerAgent(organizationId, agentId) {
        await prisma_1.prisma.agentHeartbeat.upsert({
            where: { agentId },
            update: { lastActive: new Date(), status: 'ONLINE' },
            create: { agentId, status: 'ONLINE' }
        });
    }
    async discoverAgentsByCapability(organizationId, capabilityName) {
        const agents = await prisma_1.prisma.agent.findMany({
            where: {
                organizationId,
                status: 'ACTIVE',
                capabilities: {
                    some: {
                        name: capabilityName,
                        enabled: true
                    }
                }
            },
            include: {
                capabilities: true,
                heartbeat: true
            }
        });
        return agents.map(agent => {
            const isOnline = agent.heartbeat?.status === 'ONLINE';
            const lastActive = agent.heartbeat?.lastActive;
            const minutesSinceActive = lastActive ? (Date.now() - lastActive.getTime()) / 60000 : Infinity;
            let health = 'OFFLINE';
            if (isOnline && minutesSinceActive < 5)
                health = 'HEALTHY';
            else if (isOnline && minutesSinceActive < 15)
                health = 'DEGRADED';
            return {
                id: agent.id,
                name: agent.name,
                capabilities: agent.capabilities.map(c => c.name),
                status: agent.status,
                health
            };
        });
    }
    async getAgentMetadata(organizationId, agentId) {
        const agent = await prisma_1.prisma.agent.findFirst({
            where: { id: agentId, organizationId },
            include: { capabilities: true, heartbeat: true }
        });
        if (!agent)
            return null;
        const isOnline = agent.heartbeat?.status === 'ONLINE';
        const lastActive = agent.heartbeat?.lastActive;
        const minutesSinceActive = lastActive ? (Date.now() - lastActive.getTime()) / 60000 : Infinity;
        let health = 'OFFLINE';
        if (isOnline && minutesSinceActive < 5)
            health = 'HEALTHY';
        else if (isOnline && minutesSinceActive < 15)
            health = 'DEGRADED';
        return {
            id: agent.id,
            name: agent.name,
            capabilities: agent.capabilities.map(c => c.name),
            status: agent.status,
            health
        };
    }
}
exports.RegistryEngine = RegistryEngine;
