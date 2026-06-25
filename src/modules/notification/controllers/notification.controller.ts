import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotificationEngine } from '../engine/notification.engine';

const prisma = new PrismaClient();
const notificationEngine = new NotificationEngine();

export class NotificationController {
  async send(req: Request, res: Response) {
    const { recipient, channel, body, subject, variables, priority, scheduledAt } = req.body;
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const notif = await notificationEngine.trigger({
      organizationId,
      userId,
      recipient,
      channel,
      body,
      subject,
      variables,
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    return res.status(201).json(notif);
  }

  async sendEmail(req: Request, res: Response) {
    req.body.channel = 'EMAIL';
    return this.send(req, res);
  }

  async sendSMS(req: Request, res: Response) {
    req.body.channel = 'SMS';
    return this.send(req, res);
  }

  async sendPush(req: Request, res: Response) {
    req.body.channel = 'PUSH';
    return this.send(req, res);
  }

  async sendWebhook(req: Request, res: Response) {
    req.body.channel = 'WEBHOOK';
    return this.send(req, res);
  }

  async getNotifications(req: Request, res: Response) {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const where: any = {
      organizationId,
      isDeleted: false,
    };

    if (userId) {
      where.userId = userId;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(notifications);
  }

  async getNotificationById(req: Request, res: Response) {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    const notif = await prisma.notification.findFirst({
      where: { id, organizationId },
    });

    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json(notif);
  }

  async markAsRead(req: Request, res: Response) {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    await prisma.notification.updateMany({
      where: { id, organizationId },
      data: { isRead: true, readAt: new Date() },
    });

    return res.json({ success: true });
  }

  async markAsUnread(req: Request, res: Response) {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    await prisma.notification.updateMany({
      where: { id, organizationId },
      data: { isRead: false, readAt: null },
    });

    return res.json({ success: true });
  }

  async archive(req: Request, res: Response) {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    await prisma.notification.updateMany({
      where: { id, organizationId },
      data: { isArchived: true, archivedAt: new Date() },
    });

    return res.json({ success: true });
  }

  async deleteNotification(req: Request, res: Response) {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    await prisma.notification.updateMany({
      where: { id, organizationId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return res.json({ success: true });
  }

  async getTemplates(req: Request, res: Response) {
    const organizationId = req.user?.organizationId;

    const templates = await prisma.notificationTemplate.findMany({
      where: { organizationId },
    });

    return res.json(templates);
  }

  async createTemplate(req: Request, res: Response) {
    const { name, slug, type, subject, content, language, version } = req.body;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const template = await prisma.notificationTemplate.create({
      data: {
        organizationId,
        name,
        slug,
        type,
        subject,
        content,
        language: language || 'en',
        version: version || '1.0.0',
      },
    });

    return res.status(201).json(template);
  }

  async updateTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const { name, subject, content, language, version } = req.body;
    const organizationId = req.user?.organizationId;

    await prisma.notificationTemplate.updateMany({
      where: { id, organizationId },
      data: { name, subject, content, language, version },
    });

    return res.json({ success: true });
  }

  async deleteTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    await prisma.notificationTemplate.deleteMany({
      where: { id, organizationId },
    });

    return res.json({ success: true });
  }

  async getPreferences(req: Request, res: Response) {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    let pref = await prisma.notificationPreference.findFirst({
      where: { organizationId, userId: userId || null },
    });

    if (!pref) {
      pref = await prisma.notificationPreference.create({
        data: {
          organizationId,
          userId: userId || null,
          enabledChannels: '["EMAIL", "SMS", "WHATSAPP", "PUSH", "SLACK", "MS_TEAMS", "DISCORD", "WEBHOOK", "IN_APP"]',
          disabledChannels: '[]',
        },
      });
    }

    return res.json(pref);
  }

  async updatePreferences(req: Request, res: Response) {
    const { enabledChannels, disabledChannels, quietHoursStart, quietHoursEnd, digestMode } = req.body;
    const organizationId = req.user?.organizationId;
    const userId = req.user?.id;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const where = { organizationId, userId: userId || null };
    const data = {
      enabledChannels: enabledChannels ? JSON.stringify(enabledChannels) : undefined,
      disabledChannels: disabledChannels ? JSON.stringify(disabledChannels) : undefined,
      quietHoursStart,
      quietHoursEnd,
      digestMode,
    };

    const existing = await prisma.notificationPreference.findFirst({ where });
    if (existing) {
      await prisma.notificationPreference.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.notificationPreference.create({
        data: {
          ...where,
          ...data,
        },
      });
    }

    return res.json({ success: true });
  }
}
