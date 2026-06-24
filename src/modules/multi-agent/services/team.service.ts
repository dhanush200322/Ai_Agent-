import { PrismaClient, AgentTeam, ConsensusStrategy } from '@prisma/client';

const prisma = new PrismaClient();

export class TeamService {
  async createTeam(organizationId: string, createdById: string, name: string, description?: string, consensusStrategy?: ConsensusStrategy): Promise<AgentTeam> {
    return prisma.agentTeam.create({
      data: {
        organizationId,
        createdById,
        name,
        description,
        consensusStrategy: consensusStrategy || 'STRICT'
      }
    });
  }

  async getTeam(teamId: string) {
    return prisma.agentTeam.findUnique({
      where: { id: teamId },
      include: {
        members: { include: { agent: { include: { capabilities: true } } } }
      }
    });
  }

  async addMember(teamId: string, agentId: string, role: any) {
    return prisma.agentTeamMember.create({
      data: { teamId, agentId, role }
    });
  }

  async addCapability(agentId: string, name: string, priority: number = 0) {
    return prisma.agentCapability.create({
      data: { agentId, name, priority }
    });
  }

  async getCapableAgents(teamId: string, requiredCapability: string) {
    const team = await prisma.agentTeam.findUnique({
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

    if (!team) return [];
    
    // Filter agents that have the capability
    const capable = team.members.filter(m => m.agent.capabilities.length > 0);
    
    // Sort by priority descending
    return capable.sort((a, b) => b.agent.capabilities[0].priority - a.agent.capabilities[0].priority);
  }
}
