"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationController = void 0;
const prisma_1 = require("../../../shared/prisma");
const organization_service_1 = require("../services/organization.service");
const organizationStats_service_1 = require("../services/organizationStats.service");
const ApiResponse_1 = require("../../../shared/response/ApiResponse");
class OrganizationController {
    orgService = new organization_service_1.OrganizationService();
    statsService = new organizationStats_service_1.OrganizationStatsService();
    getOrganization = async (req, res) => {
        const org = await this.orgService.getOrganization(req.user.organizationId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(org, 'Organization fetched successfully', req.reqId));
    };
    updateOrganization = async (req, res) => {
        const org = await this.orgService.updateOrganization(req.user.organizationId, req.body);
        res.status(200).json(ApiResponse_1.ApiResponse.success(org, 'Organization updated successfully', req.reqId));
    };
    getStats = async (req, res) => {
        const stats = await this.statsService.getOrganizationStats(req.user.organizationId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(stats, 'Organization stats fetched successfully', req.reqId));
    };
    getActivity = async (req, res) => {
        const { PrismaClient } = require('@prisma/client');
        const activity = await prisma_1.prisma.auditLog.findMany({
            where: { organizationId: req.user.organizationId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        res.status(200).json(ApiResponse_1.ApiResponse.success(activity, 'Organization activity fetched successfully', req.reqId));
    };
    transferOwnership = async (req, res) => {
        const { newOwnerId } = req.body;
        await this.orgService.transferOwnership(req.user.organizationId, req.user.id, newOwnerId);
        res.status(200).json(ApiResponse_1.ApiResponse.success(null, 'Ownership transferred successfully', req.reqId));
    };
}
exports.OrganizationController = OrganizationController;
