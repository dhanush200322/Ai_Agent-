import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ContextEngine {
  public async getContext(agentId: string, key: string): Promise<any | null> {
    const context = await prisma.agentContext.findUnique({
      where: { agentId_key: { agentId, key } }
    });
    return context ? JSON.parse(context.value) : null;
  }

  public async setContext(agentId: string, key: string, value: any): Promise<void> {
    await prisma.agentContext.upsert({
      where: { agentId_key: { agentId, key } },
      update: { value: JSON.stringify(value) },
      create: { agentId, key, value: JSON.stringify(value) }
    });
  }

  public async deleteContext(agentId: string, key: string): Promise<void> {
    await prisma.agentContext.delete({
      where: { agentId_key: { agentId, key } }
    });
  }

  public async getAllContext(agentId: string): Promise<Record<string, any>> {
    const contexts = await prisma.agentContext.findMany({ where: { agentId } });
    const result: Record<string, any> = {};
    for (const ctx of contexts) {
      result[ctx.key] = JSON.parse(ctx.value);
    }
    return result;
  }
}
