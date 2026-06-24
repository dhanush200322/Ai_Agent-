import { WorkflowTemplate } from '@prisma/client';
import { prisma } from '../prisma';
import { VersionEngine } from './version.engine';
const versionEngine = new VersionEngine();

export class TemplateEngine {
  
  /**
   * Saves a workflow version as a template.
   */
  async createTemplate(
    organizationId: string | null,
    name: string,
    description: string | null,
    nodes: any[],
    connections: any[],
    metadata: any = {},
    workflowId?: string
  ): Promise<WorkflowTemplate> {
    return prisma.workflowTemplate.create({
      data: {
        organizationId,
        name,
        description,
        nodes: JSON.stringify(nodes),
        connections: JSON.stringify(connections),
        metadata: JSON.stringify(metadata),
        workflowId: workflowId || null
      }
    });
  }

  /**
   * Instantiates a workflow from a template.
   */
  async instantiateTemplate(
    organizationId: string,
    userId: string,
    templateId: string,
    workflowName: string,
    workflowSlug: string
  ) {
    const template = await prisma.workflowTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) throw new Error('Template not found');

    const workflow = await prisma.workflow.create({
      data: {
        organizationId,
        createdById: userId,
        name: workflowName,
        slug: workflowSlug,
        status: 'DRAFT'
      }
    });

    const nodes = JSON.parse(template.nodes);
    const connections = JSON.parse(template.connections);
    const metadata = template.metadata ? JSON.parse(template.metadata) : {};

    await versionEngine.createVersion(workflow.id, nodes, connections, metadata);

    return workflow;
  }

  /**
   * Lists available templates (both global and organization-scoped).
   */
  async listTemplates(organizationId: string): Promise<WorkflowTemplate[]> {
    return prisma.workflowTemplate.findMany({
      where: {
        OR: [
          { organizationId: null },
          { organizationId }
        ]
      }
    });
  }
}
