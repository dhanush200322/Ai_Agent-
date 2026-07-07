import { Request, Response } from 'express';
import { VaultService } from '../services/vault.service';
import { RotationEngine } from '../engine/rotation.engine';
import { ApiResponse } from '../../../shared/response/ApiResponse';

export class VaultController {
  private vaultService = new VaultService();
  private rotationEngine = new RotationEngine();

  async storeSecret(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const actorId = req.user!.id;
    const { name, value, category, description } = req.body;

    try {
      const secretId = await this.vaultService.storeSecret(organizationId, actorId, name, value, category, description);
      res.json(ApiResponse.success({ secretId }, 'Secret created successfully', req.reqId));
    } catch (e: any) {
      res.status(400).json(ApiResponse.error(e.message, 'Failure', req.reqId));
    }
  }

  async listSecrets(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const { category } = req.query;
    
    try {
      const secrets = await this.vaultService.listSecrets(organizationId, category as string);
      res.json(ApiResponse.success(secrets, 'Secrets fetched successfully', req.reqId));
    } catch (e: any) {
      res.status(400).json(ApiResponse.error(e.message, 'Failure', req.reqId));
    }
  }

  async getStats(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    try {
      const stats = await this.vaultService.getStats(organizationId);
      res.json(ApiResponse.success(stats, 'Vault stats fetched', req.reqId));
    } catch (e: any) {
      res.status(400).json(ApiResponse.error(e.message, 'Failure', req.reqId));
    }
  }

  async retrieveSecret(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const actorId = req.user!.id;
    const { id } = req.params;
    
    try {
      const value = await this.vaultService.retrieveSecret(organizationId, id, actorId, 'USER');
      if (!value) {
        res.status(404).json(ApiResponse.error('Secret not found or disabled', 'Failure', req.reqId));
        return;
      }
      res.json(ApiResponse.success({ value }, 'Secret retrieved successfully', req.reqId));
    } catch (e: any) {
      res.status(400).json(ApiResponse.error(e.message, 'Failure', req.reqId));
    }
  }

  async rotateSecret(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const actorId = req.user!.id;
    const { id } = req.params;
    const { newValue } = req.body; 
    
    try {
      if (newValue) {
        const version = await this.vaultService.rotateSecret(organizationId, id, actorId, newValue);
        res.json(ApiResponse.success({ success: true, version }, 'Secret rotated', req.reqId));
      } else {
        await this.rotationEngine.triggerRotation(id);
        res.json(ApiResponse.success({ success: true, message: 'Rotation job queued' }, 'Rotation queued', req.reqId));
      }
    } catch (e: any) {
      res.status(400).json(ApiResponse.error(e.message, 'Failure', req.reqId));
    }
  }

  async revokeSecret(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const actorId = req.user!.id;
    const { id } = req.params;
    
    try {
      await this.vaultService.revokeSecret(organizationId, id, actorId);
      res.json(ApiResponse.success({ success: true }, 'Secret revoked', req.reqId));
    } catch (e: any) {
      res.status(400).json(ApiResponse.error(e.message, 'Failure', req.reqId));
    }
  }

  async createLease(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const actorId = req.user!.id;
    const { id } = req.params;
    const { ttlSeconds, actorType } = req.body;

    try {
      const leaseId = await this.vaultService.createLease(id, organizationId, actorId, actorType || 'PLUGIN', ttlSeconds);
      res.json(ApiResponse.success({ leaseId }, 'Lease created', req.reqId));
    } catch (e: any) {
      res.status(400).json(ApiResponse.error(e.message, 'Failure', req.reqId));
    }
  }

  async retrieveLease(req: Request, res: Response) {
    const { leaseId } = req.params;
    try {
      const value = await this.vaultService.retrieveViaLease(leaseId);
      res.json(ApiResponse.success({ value }, 'Lease retrieved', req.reqId));
    } catch (e: any) {
      res.status(400).json(ApiResponse.error(e.message, 'Failure', req.reqId));
    }
  }
}
