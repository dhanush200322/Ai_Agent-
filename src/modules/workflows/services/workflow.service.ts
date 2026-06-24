import { PrismaClient, Workflow, WorkflowVersion } from '@prisma/client';

const prisma = new PrismaClient();

export class WorkflowService {
  async createWorkflow(organizationId: string, createdById: string, name: string, slug: string, description?: string): Promise<Workflow> {
    return prisma.workflow.create({
      data: {
        organizationId,
        createdById,
        name,
        slug,
        description
      }
    });
  }

  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    return prisma.workflow.findUnique({ where: { id: workflowId } });
  }

  async createVersion(workflowId: string, nodes: any[], connections: any[], metadata: any = {}): Promise<WorkflowVersion> {
    // Find highest version
    const lastVersion = await prisma.workflowVersion.findFirst({
      where: { workflowId },
      orderBy: { version: 'desc' }
    });

    const versionNum = lastVersion ? lastVersion.version + 1 : 1;

    return prisma.workflowVersion.create({
      data: {
        workflowId,
        version: versionNum,
        nodes: JSON.stringify(nodes),
        connections: JSON.stringify(connections),
        metadata: JSON.stringify(metadata)
      }
    });
  }

  async publishVersion(workflowVersionId: string): Promise<WorkflowVersion> {
    const version = await prisma.workflowVersion.findUnique({ where: { id: workflowVersionId }});
    if (!version) throw new Error('Version not found');

    // Unpublish all other versions of this workflow
    await prisma.workflowVersion.updateMany({
      where: { workflowId: version.workflowId },
      data: { published: false }
    });

    return prisma.workflowVersion.update({
      where: { id: workflowVersionId },
      data: { published: true }
    });
  }

  async getPublishedVersion(workflowId: string): Promise<WorkflowVersion | null> {
    return prisma.workflowVersion.findFirst({
      where: { workflowId, published: true }
    });
  }
}
