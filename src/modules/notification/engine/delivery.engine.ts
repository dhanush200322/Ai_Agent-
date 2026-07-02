import { prisma } from '../../../shared/prisma';
import { PrismaClient, NotificationChannel, NotificationPriority, NotificationStatus, DeliveryStatus, NotificationProviderType } from '@prisma/client';
import { TemplateEngine } from './template.engine';
import { PreferenceEngine } from './preference.engine';
import { RoutingEngine } from './routing.engine';
import { NotificationPolicyEngine } from './policy.engine';
import { AnalyticsEngine } from './analytics.engine';
import { VaultService } from '../../vault/services/vault.service';

import { SMTPProvider } from '../providers/smtp.provider';
import { SendGridProvider } from '../providers/sendgrid.provider';
import { SESProvider } from '../providers/ses.provider';
import { TwilioSMSProvider } from '../providers/twilio.provider';
import { WhatsAppBusinessProvider } from '../providers/whatsapp.provider';
import { SlackProvider } from '../providers/slack.provider';
import { DiscordProvider } from '../providers/discord.provider';
import { WebhookProvider } from '../providers/webhook.provider';
import { FCMProvider } from '../providers/fcm.provider';
import { InAppProvider } from '../providers/inapp.provider';



export class DeliveryEngine {
  private templateEngine = new TemplateEngine();
  private preferenceEngine = new PreferenceEngine();
  private routingEngine = new RoutingEngine();
  private policyEngine = new NotificationPolicyEngine();
  private analyticsEngine = new AnalyticsEngine();
  private vaultService = new VaultService();

  async deliver(notificationId: string): Promise<boolean> {
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { template: true },
    });

    if (!notif) return false;

    const startTime = Date.now();

    // 1. Preference resolution
    const resolvedPref = await this.preferenceEngine.resolvePreferences({
      organizationId: notif.organizationId,
      userId: notif.userId || undefined,
    });

    // Check if channel enabled
    if (!this.preferenceEngine.isChannelEnabled(resolvedPref, notif.channel)) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'CANCELLED', errorMessage: 'Channel disabled by preference' },
      });
      return false;
    }

    // Check quiet hours (unless critical priority)
    if (notif.priority !== 'CRITICAL' && this.preferenceEngine.isInQuietHours(resolvedPref)) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'QUEUED', errorMessage: 'Postponed due to quiet hours' },
      });
      return false;
    }

    // 2. Policy suppression
    const isDuplicate = await this.policyEngine.shouldSuppress(notif.organizationId, notif.recipient, notif.body);
    if (isDuplicate) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'CANCELLED', errorMessage: 'Suppressed as duplicate' },
      });
      return true;
    }

    const withinLimits = await this.policyEngine.checkFrequencyLimits(notif.organizationId, notif.userId || undefined);
    if (!withinLimits) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'CANCELLED', errorMessage: 'Frequency limits exceeded' },
      });
      return false;
    }

    // 3. Render content
    let finalBody = notif.body;
    let finalSubject = notif.subject || '';
    if (notif.template) {
      const vars = notif.variables ? JSON.parse(notif.variables) : {};
      finalBody = this.templateEngine.render(notif.template.content, vars);
      finalSubject = this.templateEngine.renderSubject(notif.template.subject, vars);
      finalBody = this.templateEngine.applyBranding(finalBody, notif.template.type);
    }

    // Update rendered subject & body
    await prisma.notification.update({
      where: { id: notificationId },
      data: { body: finalBody, subject: finalSubject, status: 'PROCESSING' }
    });

    // 4. Routing
    const providerList = await this.routingEngine.getProvidersForChannel(notif.organizationId, notif.channel);
    if (providerList.length === 0) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'FAILED', errorMessage: 'No active provider found for channel' },
      });
      return false;
    }

    // 5. Try delivering using primary provider
    let success = false;
    let activeProvider = providerList[0];
    let result: any = null;

    for (let i = 0; i < providerList.length; i++) {
      activeProvider = providerList[i];
      try {
        const resolvedConfig = await this.resolveConfigSecrets(JSON.parse(activeProvider.config), notif.organizationId);
        const providerInst = this.getProviderInstance(activeProvider.type, resolvedConfig);
        
        result = await providerInst.send({
          recipient: notif.recipient,
          subject: finalSubject,
          body: finalBody,
          metadata: { notificationId, eventType: 'NOTIFICATION' }
        });

        if (result.success) {
          success = true;
          break;
        } else {
          console.warn(`Provider ${activeProvider.name} failed: ${result.errorMessage}. Trying fallback...`);
        }
      } catch (err: any) {
        console.error(`Error during provider send: ${err.message}`);
        result = { success: false, errorMessage: err.message };
      }
    }

    const latency = Date.now() - startTime;

    if (success) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          providerId: activeProvider.id,
          errorMessage: null
        },
      });

      await prisma.notificationDelivery.create({
        data: {
          notificationId,
          providerId: activeProvider.id,
          status: 'SENT',
          deliveryTime: new Date(),
          latency,
        },
      });

      await this.analyticsEngine.logEvent({
        organizationId: notif.organizationId,
        notificationId,
        channel: notif.channel,
        providerType: activeProvider.type,
        status: 'SENT',
        latency,
      });

      // Emit Billing Usage Event
      await prisma.usageEvent.create({
        data: {
          organizationId: notif.organizationId,
          type: `${notif.channel}_SENT`,
          quantity: BigInt(1),
          metadata: JSON.stringify({ notificationId, recipient: notif.recipient })
        }
      });

      return true;
    } else {
      const errorMsg = result?.errorMessage || 'Delivery failed on all providers';
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'FAILED',
          errorMessage: errorMsg,
          retryCount: notif.retryCount + 1,
        },
      });

      await prisma.notificationDelivery.create({
        data: {
          notificationId,
          status: 'FAILED',
          error: errorMsg,
          latency,
          retryCount: notif.retryCount + 1,
        },
      });

      await this.analyticsEngine.logEvent({
        organizationId: notif.organizationId,
        notificationId,
        channel: notif.channel,
        providerType: activeProvider?.type || 'SMTP',
        status: 'FAILED',
        latency,
        metadata: { error: errorMsg },
      });

      return false;
    }
  }

  private getProviderInstance(type: NotificationProviderType, config: any) {
    switch (type) {
      case 'SMTP': return new SMTPProvider(config);
      case 'SENDGRID': return new SendGridProvider(config);
      case 'SES': return new SESProvider(config);
      case 'TWILIO': return new TwilioSMSProvider(config);
      case 'WHATSAPP': return new WhatsAppBusinessProvider(config);
      case 'SLACK': return new SlackProvider(config);
      case 'DISCORD': return new DiscordProvider(config);
      case 'WEBHOOK': return new WebhookProvider(config);
      case 'FCM': return new FCMProvider(config);
      case 'INAPP': return new InAppProvider(config);
      default: throw new Error(`Unsupported provider type: ${type}`);
    }
  }

  private async resolveConfigSecrets(config: any, organizationId: string): Promise<any> {
    if (!config) return {};
    const resolved = { ...config };
    for (const [key, value] of Object.entries(resolved)) {
      if (typeof value === 'string' && value.startsWith('vault:')) {
        const secretName = value.replace('vault:', '');
        let secretObj = await prisma.vaultSecret.findFirst({
          where: { name: secretName, organizationId }
        });
        if (!secretObj) {
          secretObj = await prisma.vaultSecret.findFirst({
            where: { name: secretName }
          });
        }
        if (secretObj) {
          const secretValue = await this.vaultService.retrieveSecret(secretObj.id, '00000000-0000-0000-0000-000000000000', 'SYSTEM');
          if (secretValue) {
            resolved[key] = secretValue;
          }
        }
      }
    }
    return resolved;
  }
}
