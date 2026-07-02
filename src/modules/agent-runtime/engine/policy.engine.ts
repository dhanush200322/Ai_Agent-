import { prisma } from '../../../shared/prisma';
import { PrismaClient } from '@prisma/client';



export class PolicyEngine {
  public async validateExecution(organizationId: string, agentId: string): Promise<boolean> {
    const policy = await prisma.agentPolicy.findFirst({
      where: { organizationId }
    });

    if (!policy) return true; // No policy means allowed

    const rules = JSON.parse(policy.rules);
    
    // Evaluate rules (e.g. max cost, forbidden models)
    if (rules.forbiddenModels && rules.forbiddenModels.includes('some-model')) {
      return false;
    }

    return true;
  }
}
