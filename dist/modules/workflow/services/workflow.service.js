"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const prisma_1 = require("../prisma");
const version_engine_1 = require("../engine/version.engine");
const versionEngine = new version_engine_1.VersionEngine();
class WorkflowService {
    async createWorkflow(organizationId, createdById, name, slug, description) {
        return prisma_1.prisma.workflow.create({
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
    async getWorkflow(workflowId) {
        return prisma_1.prisma.workflow.findUnique({
            where: { id: workflowId },
            include: {
                versions: { orderBy: { version: 'desc' } }
            }
        });
    }
    async updateWorkflow(workflowId, data) {
        return prisma_1.prisma.workflow.update({
            where: { id: workflowId },
            data
        });
    }
    async archiveWorkflow(workflowId) {
        return prisma_1.prisma.workflow.update({
            where: { id: workflowId },
            data: { status: 'ARCHIVED' }
        });
    }
    async unarchiveWorkflow(workflowId) {
        return prisma_1.prisma.workflow.update({
            where: { id: workflowId },
            data: { status: 'DRAFT' } // defaults back to draft or active
        });
    }
    async duplicateWorkflow(workflowId, newName, newSlug) {
        const original = await prisma_1.prisma.workflow.findUnique({
            where: { id: workflowId },
            include: { versions: true }
        });
        if (!original)
            throw new Error('Workflow not found');
        const duplicate = await prisma_1.prisma.workflow.create({
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
            await versionEngine.createVersion(duplicate.id, JSON.parse(activeVersion.nodes), JSON.parse(activeVersion.connections), JSON.parse(activeVersion.metadata));
        }
        return duplicate;
    }
    async deleteWorkflowSoft(workflowId) {
        return prisma_1.prisma.workflow.update({
            where: { id: workflowId },
            data: { deletedAt: new Date() }
        });
    }
    async restoreWorkflowSoft(workflowId) {
        return prisma_1.prisma.workflow.update({
            where: { id: workflowId },
            data: { deletedAt: null }
        });
    }
    async createVersion(workflowId, nodes, connections, metadata = {}) {
        return versionEngine.createVersion(workflowId, nodes, connections, metadata);
    }
    async publishVersion(workflowVersionId) {
        return versionEngine.publishVersion(workflowVersionId);
    }
    async getPublishedVersion(workflowId) {
        return prisma_1.prisma.workflowVersion.findFirst({
            where: { workflowId, published: true }
        });
    }
}
exports.WorkflowService = WorkflowService;
