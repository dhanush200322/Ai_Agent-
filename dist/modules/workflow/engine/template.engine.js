"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEngine = void 0;
const prisma_1 = require("../prisma");
const version_engine_1 = require("./version.engine");
const versionEngine = new version_engine_1.VersionEngine();
class TemplateEngine {
    /**
     * Saves a workflow version as a template.
     */
    async createTemplate(organizationId, name, description, nodes, connections, metadata = {}, workflowId) {
        return prisma_1.prisma.workflowTemplate.create({
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
    async instantiateTemplate(organizationId, userId, templateId, workflowName, workflowSlug) {
        const template = await prisma_1.prisma.workflowTemplate.findUnique({
            where: { id: templateId }
        });
        if (!template)
            throw new Error('Template not found');
        const workflow = await prisma_1.prisma.workflow.create({
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
    async listTemplates(organizationId) {
        return prisma_1.prisma.workflowTemplate.findMany({
            where: {
                OR: [
                    { organizationId: null },
                    { organizationId }
                ]
            }
        });
    }
}
exports.TemplateEngine = TemplateEngine;
