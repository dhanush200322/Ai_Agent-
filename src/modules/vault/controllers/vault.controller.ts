import { Request, Response } from 'express';
import { VaultService } from '../services/vault.service';
import { RotationEngine } from '../engine/rotation.engine';

export class VaultController {
  private vaultService = new VaultService();
  private rotationEngine = new RotationEngine();

  async storeSecret(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const actorId = req.user!.id;
    const { name, value, category, description } = req.body;

    try {
      const secretId = await this.vaultService.storeSecret(organizationId, actorId, name, value, category, description);
      res.json({ secretId });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async listSecrets(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const { category } = req.query;
    
    try {
      const secrets = await this.vaultService.listSecrets(organizationId, category as string);
      res.json(secrets);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async retrieveSecret(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const actorId = req.user!.id;
    const { id } = req.params;
    
    try {
      const value = await this.vaultService.retrieveSecret(organizationId, id, actorId, 'USER');
      if (!value) {
        res.status(404).json({ error: 'Secret not found or disabled' });
        return;
      }
      res.json({ value });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async rotateSecret(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const actorId = req.user!.id;
    const { id } = req.params;
    const { newValue } = req.body; // Manual Rotation
    
    try {
      if (newValue) {
        const version = await this.vaultService.rotateSecret(organizationId, id, actorId, newValue);
        res.json({ success: true, version });
      } else {
        // Trigger automated rotation
        await this.rotationEngine.triggerRotation(id);
        res.json({ success: true, message: 'Rotation job queued' });
      }
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async revokeSecret(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const actorId = req.user!.id;
    const { id } = req.params;
    
    try {
      await this.vaultService.revokeSecret(organizationId, id, actorId);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async createLease(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const actorId = req.user!.id;
    const { id } = req.params;
    const { ttlSeconds, actorType } = req.body;

    try {
      const leaseId = await this.vaultService.createLease(id, organizationId, actorId, actorType || 'PLUGIN', ttlSeconds);
      res.json({ leaseId });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async retrieveLease(req: Request, res: Response) {
    const { leaseId } = req.params;
    try {
      const value = await this.vaultService.retrieveViaLease(leaseId);
      res.json({ value });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
