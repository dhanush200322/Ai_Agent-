import { Request, Response } from 'express';
import { OrganizationService } from '../services/organization.service';
import { OrganizationStatsService } from '../services/organizationStats.service';
import { ApiResponse } from '../../../shared/response/ApiResponse';

export class OrganizationController {
  private orgService = new OrganizationService();
  private statsService = new OrganizationStatsService();

  getOrganization = async (req: Request, res: Response) => {
    const org = await this.orgService.getOrganization(req.user!.organizationId);
    res.status(200).json(ApiResponse.success(org, 'Organization fetched successfully', req.reqId));
  };

  updateOrganization = async (req: Request, res: Response) => {
    const org = await this.orgService.updateOrganization(req.user!.organizationId, req.body);
    res.status(200).json(ApiResponse.success(org, 'Organization updated successfully', req.reqId));
  };

  getStats = async (req: Request, res: Response) => {
    const stats = await this.statsService.getOrganizationStats(req.user!.organizationId);
    res.status(200).json(ApiResponse.success(stats, 'Organization stats fetched successfully', req.reqId));
  };
  
  transferOwnership = async (req: Request, res: Response) => {
    const { newOwnerId } = req.body;
    await this.orgService.transferOwnership(req.user!.organizationId, req.user!.id, newOwnerId);
    res.status(200).json(ApiResponse.success(null, 'Ownership transferred successfully', req.reqId));
  };
}
