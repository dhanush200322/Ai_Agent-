import { OrganizationRepository } from '../repositories/organization.repository';
import { AuditLogger } from '../../../shared/audit/auditLogger';
import { NotFoundError } from '../../../shared/errors/AppError';

export class OrganizationService {
  private orgRepo = new OrganizationRepository();

  async getOrganization(id: string) {
    const org = await this.orgRepo.findOrganizationById(id);
    if (!org) throw new NotFoundError('Organization not found');
    return org;
  }

  async updateOrganization(id: string, data: any) {
    const org = await this.orgRepo.updateOrganization(id, data);
    AuditLogger.log('ORGANIZATION_UPDATED', 'organization', { organizationId: id, updates: Object.keys(data) });
    return org;
  }
  
  async transferOwnership(organizationId: string, currentOwnerId: string, newOwnerId: string) {
    await this.orgRepo.transferOwnership(organizationId, currentOwnerId, newOwnerId);
    AuditLogger.log('OWNERSHIP_TRANSFERRED', 'organization', { organizationId, newOwnerId });
    return { success: true };
  }
}
