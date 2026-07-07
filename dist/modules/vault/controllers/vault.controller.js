"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultController = void 0;
const vault_service_1 = require("../services/vault.service");
const rotation_engine_1 = require("../engine/rotation.engine");
const ApiResponse_1 = require("../../../shared/response/ApiResponse");
class VaultController {
    vaultService = new vault_service_1.VaultService();
    rotationEngine = new rotation_engine_1.RotationEngine();
    async storeSecret(req, res) {
        const organizationId = req.user.organizationId;
        const actorId = req.user.id;
        const { name, value, category, description } = req.body;
        try {
            const secretId = await this.vaultService.storeSecret(organizationId, actorId, name, value, category, description);
            res.json(ApiResponse_1.ApiResponse.success({ secretId }, 'Secret created successfully', req.reqId));
        }
        catch (e) {
            res.status(400).json(ApiResponse_1.ApiResponse.error(e.message, 'Failure', req.reqId));
        }
    }
    async listSecrets(req, res) {
        const organizationId = req.user.organizationId;
        const { category } = req.query;
        try {
            const secrets = await this.vaultService.listSecrets(organizationId, category);
            res.json(ApiResponse_1.ApiResponse.success(secrets, 'Secrets fetched successfully', req.reqId));
        }
        catch (e) {
            res.status(400).json(ApiResponse_1.ApiResponse.error(e.message, 'Failure', req.reqId));
        }
    }
    async getStats(req, res) {
        const organizationId = req.user.organizationId;
        try {
            const stats = await this.vaultService.getStats(organizationId);
            res.json(ApiResponse_1.ApiResponse.success(stats, 'Vault stats fetched', req.reqId));
        }
        catch (e) {
            res.status(400).json(ApiResponse_1.ApiResponse.error(e.message, 'Failure', req.reqId));
        }
    }
    async retrieveSecret(req, res) {
        const organizationId = req.user.organizationId;
        const actorId = req.user.id;
        const { id } = req.params;
        try {
            const value = await this.vaultService.retrieveSecret(organizationId, id, actorId, 'USER');
            if (!value) {
                res.status(404).json(ApiResponse_1.ApiResponse.error('Secret not found or disabled', 'Failure', req.reqId));
                return;
            }
            res.json(ApiResponse_1.ApiResponse.success({ value }, 'Secret retrieved successfully', req.reqId));
        }
        catch (e) {
            res.status(400).json(ApiResponse_1.ApiResponse.error(e.message, 'Failure', req.reqId));
        }
    }
    async rotateSecret(req, res) {
        const organizationId = req.user.organizationId;
        const actorId = req.user.id;
        const { id } = req.params;
        const { newValue } = req.body;
        try {
            if (newValue) {
                const version = await this.vaultService.rotateSecret(organizationId, id, actorId, newValue);
                res.json(ApiResponse_1.ApiResponse.success({ success: true, version }, 'Secret rotated', req.reqId));
            }
            else {
                await this.rotationEngine.triggerRotation(id);
                res.json(ApiResponse_1.ApiResponse.success({ success: true, message: 'Rotation job queued' }, 'Rotation queued', req.reqId));
            }
        }
        catch (e) {
            res.status(400).json(ApiResponse_1.ApiResponse.error(e.message, 'Failure', req.reqId));
        }
    }
    async revokeSecret(req, res) {
        const organizationId = req.user.organizationId;
        const actorId = req.user.id;
        const { id } = req.params;
        try {
            await this.vaultService.revokeSecret(organizationId, id, actorId);
            res.json(ApiResponse_1.ApiResponse.success({ success: true }, 'Secret revoked', req.reqId));
        }
        catch (e) {
            res.status(400).json(ApiResponse_1.ApiResponse.error(e.message, 'Failure', req.reqId));
        }
    }
    async createLease(req, res) {
        const organizationId = req.user.organizationId;
        const actorId = req.user.id;
        const { id } = req.params;
        const { ttlSeconds, actorType } = req.body;
        try {
            const leaseId = await this.vaultService.createLease(id, organizationId, actorId, actorType || 'PLUGIN', ttlSeconds);
            res.json(ApiResponse_1.ApiResponse.success({ leaseId }, 'Lease created', req.reqId));
        }
        catch (e) {
            res.status(400).json(ApiResponse_1.ApiResponse.error(e.message, 'Failure', req.reqId));
        }
    }
    async retrieveLease(req, res) {
        const { leaseId } = req.params;
        try {
            const value = await this.vaultService.retrieveViaLease(leaseId);
            res.json(ApiResponse_1.ApiResponse.success({ value }, 'Lease retrieved', req.reqId));
        }
        catch (e) {
            res.status(400).json(ApiResponse_1.ApiResponse.error(e.message, 'Failure', req.reqId));
        }
    }
}
exports.VaultController = VaultController;
