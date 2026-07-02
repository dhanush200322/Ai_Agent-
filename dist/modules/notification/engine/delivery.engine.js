"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const template_engine_1 = require("./template.engine");
const preference_engine_1 = require("./preference.engine");
const routing_engine_1 = require("./routing.engine");
const policy_engine_1 = require("./policy.engine");
const analytics_engine_1 = require("./analytics.engine");
const vault_service_1 = require("../../vault/services/vault.service");
const smtp_provider_1 = require("../providers/smtp.provider");
const sendgrid_provider_1 = require("../providers/sendgrid.provider");
const ses_provider_1 = require("../providers/ses.provider");
const twilio_provider_1 = require("../providers/twilio.provider");
const whatsapp_provider_1 = require("../providers/whatsapp.provider");
const slack_provider_1 = require("../providers/slack.provider");
const discord_provider_1 = require("../providers/discord.provider");
const webhook_provider_1 = require("../providers/webhook.provider");
const fcm_provider_1 = require("../providers/fcm.provider");
const inapp_provider_1 = require("../providers/inapp.provider");
class DeliveryEngine {
    templateEngine = new template_engine_1.TemplateEngine();
    preferenceEngine = new preference_engine_1.PreferenceEngine();
    routingEngine = new routing_engine_1.RoutingEngine();
    policyEngine = new policy_engine_1.NotificationPolicyEngine();
    analyticsEngine = new analytics_engine_1.AnalyticsEngine();
    vaultService = new vault_service_1.VaultService();
    async deliver(notificationId) {
        const notif = await prisma_1.prisma.notification.findUnique({
            where: { id: notificationId },
            include: { template: true },
        });
        if (!notif)
            return false;
        const startTime = Date.now();
        // 1. Preference resolution
        const resolvedPref = await this.preferenceEngine.resolvePreferences({
            organizationId: notif.organizationId,
            userId: notif.userId || undefined,
        });
        // Check if channel enabled
        if (!this.preferenceEngine.isChannelEnabled(resolvedPref, notif.channel)) {
            await prisma_1.prisma.notification.update({
                where: { id: notificationId },
                data: { status: 'CANCELLED', errorMessage: 'Channel disabled by preference' },
            });
            return false;
        }
        // Check quiet hours (unless critical priority)
        if (notif.priority !== 'CRITICAL' && this.preferenceEngine.isInQuietHours(resolvedPref)) {
            await prisma_1.prisma.notification.update({
                where: { id: notificationId },
                data: { status: 'QUEUED', errorMessage: 'Postponed due to quiet hours' },
            });
            return false;
        }
        // 2. Policy suppression
        const isDuplicate = await this.policyEngine.shouldSuppress(notif.organizationId, notif.recipient, notif.body);
        if (isDuplicate) {
            await prisma_1.prisma.notification.update({
                where: { id: notificationId },
                data: { status: 'CANCELLED', errorMessage: 'Suppressed as duplicate' },
            });
            return true;
        }
        const withinLimits = await this.policyEngine.checkFrequencyLimits(notif.organizationId, notif.userId || undefined);
        if (!withinLimits) {
            await prisma_1.prisma.notification.update({
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
        await prisma_1.prisma.notification.update({
            where: { id: notificationId },
            data: { body: finalBody, subject: finalSubject, status: 'PROCESSING' }
        });
        // 4. Routing
        const providerList = await this.routingEngine.getProvidersForChannel(notif.organizationId, notif.channel);
        if (providerList.length === 0) {
            await prisma_1.prisma.notification.update({
                where: { id: notificationId },
                data: { status: 'FAILED', errorMessage: 'No active provider found for channel' },
            });
            return false;
        }
        // 5. Try delivering using primary provider
        let success = false;
        let activeProvider = providerList[0];
        let result = null;
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
                }
                else {
                    console.warn(`Provider ${activeProvider.name} failed: ${result.errorMessage}. Trying fallback...`);
                }
            }
            catch (err) {
                console.error(`Error during provider send: ${err.message}`);
                result = { success: false, errorMessage: err.message };
            }
        }
        const latency = Date.now() - startTime;
        if (success) {
            await prisma_1.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                    providerId: activeProvider.id,
                    errorMessage: null
                },
            });
            await prisma_1.prisma.notificationDelivery.create({
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
            await prisma_1.prisma.usageEvent.create({
                data: {
                    organizationId: notif.organizationId,
                    type: `${notif.channel}_SENT`,
                    quantity: BigInt(1),
                    metadata: JSON.stringify({ notificationId, recipient: notif.recipient })
                }
            });
            return true;
        }
        else {
            const errorMsg = result?.errorMessage || 'Delivery failed on all providers';
            await prisma_1.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: 'FAILED',
                    errorMessage: errorMsg,
                    retryCount: notif.retryCount + 1,
                },
            });
            await prisma_1.prisma.notificationDelivery.create({
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
    getProviderInstance(type, config) {
        switch (type) {
            case 'SMTP': return new smtp_provider_1.SMTPProvider(config);
            case 'SENDGRID': return new sendgrid_provider_1.SendGridProvider(config);
            case 'SES': return new ses_provider_1.SESProvider(config);
            case 'TWILIO': return new twilio_provider_1.TwilioSMSProvider(config);
            case 'WHATSAPP': return new whatsapp_provider_1.WhatsAppBusinessProvider(config);
            case 'SLACK': return new slack_provider_1.SlackProvider(config);
            case 'DISCORD': return new discord_provider_1.DiscordProvider(config);
            case 'WEBHOOK': return new webhook_provider_1.WebhookProvider(config);
            case 'FCM': return new fcm_provider_1.FCMProvider(config);
            case 'INAPP': return new inapp_provider_1.InAppProvider(config);
            default: throw new Error(`Unsupported provider type: ${type}`);
        }
    }
    async resolveConfigSecrets(config, organizationId) {
        if (!config)
            return {};
        const resolved = { ...config };
        for (const [key, value] of Object.entries(resolved)) {
            if (typeof value === 'string' && value.startsWith('vault:')) {
                const secretName = value.replace('vault:', '');
                let secretObj = await prisma_1.prisma.vaultSecret.findFirst({
                    where: { name: secretName, organizationId }
                });
                if (!secretObj) {
                    secretObj = await prisma_1.prisma.vaultSecret.findFirst({
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
exports.DeliveryEngine = DeliveryEngine;
