"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const prisma_1 = require("../../../shared/prisma");
class TeamService {
    async createTeam(organizationId, createdById, name, description, consensusStrategy) {
        return prisma_1.prisma.agentTeam.create({
            data: {
                organizationId,
                createdById,
                name,
                description,
                consensusStrategy: consensusStrategy || 'STRICT'
            }
        });
    }
    async getTeam(teamId) {
        return prisma_1.prisma.agentTeam.findUnique({
            where: { id: teamId },
            include: {
                members: { include: { agent: { include: { capabilities: true } } } }
            }
        });
    }
    async addMember(teamId, agentId, role) {
        return prisma_1.prisma.agentTeamMember.create({
            data: { teamId, agentId, role }
        });
    }
    async addCapability(agentId, name, priority = 0) {
        return prisma_1.prisma.agentCapability.create({
            data: { agentId, name, priority }
        });
    }
    async getCapableAgents(teamId, requiredCapability) {
        const team = await prisma_1.prisma.agentTeam.findUnique({
            where: { id: teamId },
            include: {
                members: {
                    include: {
                        agent: {
                            include: { capabilities: { where: { name: requiredCapability, enabled: true } } }
                        }
                    }
                }
            }
        });
        if (!team)
            return [];
        // Filter agents that have the capability
        const capable = team.members.filter(m => m.agent.capabilities.length > 0);
        // Sort by priority descending
        return capable.sort((a, b) => b.agent.capabilities[0].priority - a.agent.capabilities[0].priority);
    }
}
exports.TeamService = TeamService;
