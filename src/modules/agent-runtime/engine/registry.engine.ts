import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export interface AgentMetadata {
  id: string;
  name: string;
  capabilities: string[];
  status: string;
  health: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
}

export class RegistryEngine {
  public async registerAgent(organizationId: string, agentId: string): Promise<void> {
    await prisma.agentHeartbeat.upsert({
      where: { agentId },
      update: { lastActive: new Date(), status: 'ONLINE' },
      create: { agentId, status: 'ONLINE' }
    });
  }

  public async discoverAgentsByCapability(organizationId: string, capabilityName: string): Promise<AgentMetadata[]> {
    const agents = await prisma.agent.findMany({
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
      
      let health: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' = 'OFFLINE';
      if (isOnline && minutesSinceActive < 5) health = 'HEALTHY';
      else if (isOnline && minutesSinceActive < 15) health = 'DEGRADED';

      return {
        id: agent.id,
        name: agent.name,
        capabilities: agent.capabilities.map(c => c.name),
        status: agent.status,
        health
      };
    });
  }

  public async getAgentMetadata(organizationId: string, agentId: string): Promise<AgentMetadata | null> {
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, organizationId },
      include: { capabilities: true, heartbeat: true }
    });

    if (!agent) return null;

    const isOnline = agent.heartbeat?.status === 'ONLINE';
    const lastActive = agent.heartbeat?.lastActive;
    const minutesSinceActive = lastActive ? (Date.now() - lastActive.getTime()) / 60000 : Infinity;
    
    let health: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' = 'OFFLINE';
    if (isOnline && minutesSinceActive < 5) health = 'HEALTHY';
    else if (isOnline && minutesSinceActive < 15) health = 'DEGRADED';

    return {
      id: agent.id,
      name: agent.name,
      capabilities: agent.capabilities.map(c => c.name),
      status: agent.status,
      health
    };
  }
}
