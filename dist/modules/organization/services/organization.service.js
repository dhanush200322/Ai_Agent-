"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const organization_repository_1 = require("../repositories/organization.repository");
const auditLogger_1 = require("../../../shared/audit/auditLogger");
const AppError_1 = require("../../../shared/errors/AppError");
class OrganizationService {
    orgRepo = new organization_repository_1.OrganizationRepository();
    async getOrganization(id) {
        const org = await this.orgRepo.findOrganizationById(id);
        if (!org)
            throw new AppError_1.NotFoundError('Organization not found');
        return org;
    }
    async updateOrganization(id, data) {
        const org = await this.orgRepo.updateOrganization(id, data);
        auditLogger_1.AuditLogger.log('ORGANIZATION_UPDATED', 'organization', { organizationId: id, updates: Object.keys(data) });
        return org;
    }
    async transferOwnership(organizationId, currentOwnerId, newOwnerId) {
        await this.orgRepo.transferOwnership(organizationId, currentOwnerId, newOwnerId);
        auditLogger_1.AuditLogger.log('OWNERSHIP_TRANSFERRED', 'organization', { organizationId, newOwnerId });
        return { success: true };
    }
}
exports.OrganizationService = OrganizationService;
