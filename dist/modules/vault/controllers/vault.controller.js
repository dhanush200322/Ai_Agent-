"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultController = void 0;
const vault_service_1 = require("../services/vault.service");
const rotation_engine_1 = require("../engine/rotation.engine");
class VaultController {
    vaultService = new vault_service_1.VaultService();
    rotationEngine = new rotation_engine_1.RotationEngine();
    async storeSecret(req, res) {
        const organizationId = req.user.organizationId;
        const actorId = req.user.id;
        const { name, value, category, description } = req.body;
        try {
            const secretId = await this.vaultService.storeSecret(organizationId, actorId, name, value, category, description);
            res.json({ secretId });
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    async listSecrets(req, res) {
        const organizationId = req.user.organizationId;
        const { category } = req.query;
        try {
            const secrets = await this.vaultService.listSecrets(organizationId, category);
            res.json(secrets);
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    async retrieveSecret(req, res) {
        const actorId = req.user.id;
        const { id } = req.params;
        try {
            const value = await this.vaultService.retrieveSecret(id, actorId, 'USER');
            if (!value) {
                res.status(404).json({ error: 'Secret not found or disabled' });
                return;
            }
            res.json({ value });
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    async rotateSecret(req, res) {
        const actorId = req.user.id;
        const { id } = req.params;
        const { newValue } = req.body; // Manual Rotation
        try {
            if (newValue) {
                const version = await this.vaultService.rotateSecret(id, actorId, newValue);
                res.json({ success: true, version });
            }
            else {
                // Trigger automated rotation
                await this.rotationEngine.triggerRotation(id);
                res.json({ success: true, message: 'Rotation job queued' });
            }
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    async revokeSecret(req, res) {
        const actorId = req.user.id;
        const { id } = req.params;
        try {
            await this.vaultService.revokeSecret(id, actorId);
            res.json({ success: true });
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    async createLease(req, res) {
        const organizationId = req.user.organizationId;
        const actorId = req.user.id;
        const { id } = req.params;
        const { ttlSeconds, actorType } = req.body;
        try {
            const leaseId = await this.vaultService.createLease(id, organizationId, actorId, actorType || 'PLUGIN', ttlSeconds);
            res.json({ leaseId });
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
    async retrieveLease(req, res) {
        const { leaseId } = req.params;
        try {
            const value = await this.vaultService.retrieveViaLease(leaseId);
            res.json({ value });
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
}
exports.VaultController = VaultController;
