import { WorkflowVersion } from '@prisma/client';
import { prisma } from '../prisma';

export class VersionEngine {
  
  /**
   * Creates a new draft version for a workflow.
   */
  async createVersion(
    workflowId: string,
    nodes: any[],
    connections: any[],
    metadata: any = {}
  ): Promise<WorkflowVersion> {
    const lastVersion = await prisma.workflowVersion.findFirst({
      where: { workflowId },
      orderBy: { version: 'desc' }
    });

    const versionNum = lastVersion ? lastVersion.version + 1 : 1;

    // Create the draft version
    const version = await prisma.workflowVersion.create({
      data: {
        workflowId,
        version: versionNum,
        nodes: JSON.stringify(nodes),
        connections: JSON.stringify(connections),
        metadata: JSON.stringify(metadata),
        published: false,
        status: 'DRAFT'
      }
    });

    // Populate WorkflowNode and WorkflowConnection relational tables
    if (nodes && nodes.length > 0) {
      await prisma.workflowNode.createMany({
        data: nodes.map(n => ({
          nodeId: n.id,
          workflowVersionId: version.id,
          type: n.type,
          label: n.label || '',
          config: JSON.stringify(n.config || {}),
          metadata: JSON.stringify(n.metadata || {})
        }))
      });
    }

    if (connections && connections.length > 0) {
      await prisma.workflowConnection.createMany({
        data: connections.map(c => ({
          workflowVersionId: version.id,
          sourceNodeId: c.source,
          targetNodeId: c.target,
          sourceHandle: c.sourceHandle || null,
          targetHandle: c.targetHandle || null,
          condition: c.condition || null
        }))
      });
    }

    return version;
  }

  /**
   * Publishes a version, setting all other versions of the same workflow to UNPUBLISHED/DRAFT.
   */
  async publishVersion(versionId: string): Promise<WorkflowVersion> {
    const version = await prisma.workflowVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new Error('Version not found');

    // 1. Unpublish other versions
    await prisma.workflowVersion.updateMany({
      where: { workflowId: version.workflowId },
      data: { published: false, status: 'DRAFT' }
    });

    // 2. Publish selected version
    const updatedVersion = await prisma.workflowVersion.update({
      where: { id: versionId },
      data: { published: true, status: 'PUBLISHED' }
    });

    // Also update parent workflow status to ACTIVE
    await prisma.workflow.update({
      where: { id: version.workflowId },
      data: { status: 'ACTIVE' }
    });

    return updatedVersion;
  }

  /**
   * Rolls back a workflow's published version to a historical version number.
   */
  async rollbackToVersion(workflowId: string, versionNumber: number): Promise<WorkflowVersion> {
    const targetVersion = await prisma.workflowVersion.findUnique({
      where: {
        workflowId_version: {
          workflowId,
          version: versionNumber
        }
      }
    });

    if (!targetVersion) {
      throw new Error(`Version ${versionNumber} not found for workflow ${workflowId}`);
    }

    return this.publishVersion(targetVersion.id);
  }

  /**
   * Clones a workflow definition to a new workflow.
   */
  async cloneWorkflow(
    organizationId: string,
    userId: string,
    workflowId: string,
    newName: string,
    newSlug: string
  ) {
    const original = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { versions: { orderBy: { version: 'desc' } } }
    });

    if (!original) throw new Error('Original workflow not found');

    const clonedWf = await prisma.workflow.create({
      data: {
        organizationId,
        createdById: userId,
        name: newName,
        slug: newSlug,
        status: 'DRAFT'
      }
    });

    const activeVersion = original.versions.find(v => v.published) || original.versions[0];
    if (activeVersion) {
      await this.createVersion(
        clonedWf.id,
        JSON.parse(activeVersion.nodes),
        JSON.parse(activeVersion.connections),
        JSON.parse(activeVersion.metadata)
      );
    }

    return clonedWf;
  }
}
