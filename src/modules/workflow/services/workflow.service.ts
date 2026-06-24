import { Workflow, WorkflowVersion } from '@prisma/client';
import { prisma } from '../prisma';
import { VersionEngine } from '../engine/version.engine';
const versionEngine = new VersionEngine();

export class WorkflowService {
  
  async createWorkflow(
    organizationId: string,
    createdById: string,
    name: string,
    slug: string,
    description?: string
  ): Promise<Workflow> {
    return prisma.workflow.create({
      data: {
        organizationId,
        createdById,
        name,
        slug,
        description,
        status: 'DRAFT'
      }
    });
  }

  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    return prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        versions: { orderBy: { version: 'desc' } }
      }
    });
  }

  async updateWorkflow(
    workflowId: string,
    data: { name?: string; slug?: string; description?: string; status?: any }
  ): Promise<Workflow> {
    return prisma.workflow.update({
      where: { id: workflowId },
      data
    });
  }

  async archiveWorkflow(workflowId: string): Promise<Workflow> {
    return prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'ARCHIVED' }
    });
  }

  async unarchiveWorkflow(workflowId: string): Promise<Workflow> {
    return prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'DRAFT' } // defaults back to draft or active
    });
  }

  async duplicateWorkflow(
    workflowId: string,
    newName: string,
    newSlug: string
  ): Promise<Workflow> {
    const original = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { versions: true }
    });

    if (!original) throw new Error('Workflow not found');

    const duplicate = await prisma.workflow.create({
      data: {
        organizationId: original.organizationId,
        createdById: original.createdById,
        name: newName,
        slug: newSlug,
        status: 'DRAFT'
      }
    });

    const activeVersion = original.versions.find(v => v.published) || original.versions[0];
    if (activeVersion) {
      await versionEngine.createVersion(
        duplicate.id,
        JSON.parse(activeVersion.nodes),
        JSON.parse(activeVersion.connections),
        JSON.parse(activeVersion.metadata)
      );
    }

    return duplicate;
  }

  async deleteWorkflowSoft(workflowId: string): Promise<Workflow> {
    return prisma.workflow.update({
      where: { id: workflowId },
      data: { deletedAt: new Date() }
    });
  }

  async restoreWorkflowSoft(workflowId: string): Promise<Workflow> {
    return prisma.workflow.update({
      where: { id: workflowId },
      data: { deletedAt: null }
    });
  }

  async createVersion(
    workflowId: string,
    nodes: any[],
    connections: any[],
    metadata: any = {}
  ): Promise<WorkflowVersion> {
    return versionEngine.createVersion(workflowId, nodes, connections, metadata);
  }

  async publishVersion(workflowVersionId: string): Promise<WorkflowVersion> {
    return versionEngine.publishVersion(workflowVersionId);
  }

  async getPublishedVersion(workflowId: string): Promise<WorkflowVersion | null> {
    return prisma.workflowVersion.findFirst({
      where: { workflowId, published: true }
    });
  }
}
