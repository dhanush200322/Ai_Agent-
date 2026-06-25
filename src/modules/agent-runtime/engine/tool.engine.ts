import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ToolEngine {
  public async executeTool(executionId: string, toolId: string, input: Record<string, any>, overrideConversationId?: string): Promise<any> {
    const execution = await prisma.agentExecution.findUnique({
      where: { id: executionId },
      include: { agent: true, session: true }
    });

    if (!execution) throw new Error('Execution not found');

    const conversationId = overrideConversationId || execution.session?.id || executionId; // Mock conversationId for ToolExecution

    const toolExecution = await prisma.toolExecution.create({
      data: {
        conversationId,
        agentId: execution.agentId,
        toolId,
        status: 'RUNNING',
        input: JSON.stringify(input)
      }
    });

    try {
      // Mock actual tool execution call
      const output = JSON.stringify({ success: true, executedAt: new Date() });
      
      await prisma.toolExecution.update({
        where: { id: toolExecution.id },
        data: {
          status: 'COMPLETED',
          output,
          finishedAt: new Date(),
          duration: 200
        }
      });
      return JSON.parse(output);
    } catch (error: any) {
      await prisma.toolExecution.update({
        where: { id: toolExecution.id },
        data: {
          status: 'FAILED',
          error: error.message,
          finishedAt: new Date()
        }
      });
      throw error;
    }
  }

  public async discoverTools(agentId: string): Promise<any[]> {
    const agentTools = await prisma.agentTool.findMany({
      where: { agentId, enabled: true },
      include: { tool: true }
    });
    return agentTools.map(at => at.tool);
  }
}
