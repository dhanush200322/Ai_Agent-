import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { contactSubmissionSchema } from '../validators/contact.validator';
import path from 'path';
import fs from 'fs';

export class ContactController {
  private contactService = new ContactService();
  private notificationService = new NotificationService();

  public submitContact = async (req: Request, res: Response) => {
    try {
      // Validate honeypot
      if (req.body.honeypot) {
        return res.status(200).json({ success: true, message: 'Submission received.' }); // silently ignore bot
      }

      // Validate schema
      const validationResult = contactSubmissionSchema.safeParse({ body: req.body });
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Validation failed', details: validationResult.error.issues });
      }

      const files = req.files as Express.Multer.File[];

      const data = {
        ...req.body,
        ipAddress: req.ip || req.socket.remoteAddress,
        browser: req.headers['user-agent']
      };

      const submission = await this.contactService.createSubmission(data, files);

      // Async send email without blocking the response
      this.notificationService.sendContactNotification(submission.id).catch(err => {
        console.error('Background email task failed:', err);
      });

      return res.status(201).json({
        success: true,
        message: 'Your message has been received successfully. We will contact you shortly.',
        data: { id: submission.id }
      });
    } catch (error: any) {
      console.error('ContactController submitContact error:', error);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  };

  public getSubmissions = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.contactService.getSubmissions(page, limit, search);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  };

  public updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await this.contactService.updateStatus(id, status);
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  };

  public deleteSubmission = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.contactService.deleteSubmission(id);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  };

  public downloadAttachment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // In a real scenario, you'd fetch attachment by ID from DB to get the path
      // But for speed, let's assume we fetch it via service or prisma directly here:
      const { prisma } = require('../../../shared/prisma');
      const attachment = await prisma.contactAttachment.findUnique({ where: { id } });
      
      if (!attachment) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      const filePath = path.join(__dirname, '../../../../public', attachment.path);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      res.download(filePath, attachment.originalName);
      return;
    } catch (error: any) {
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  };
}
