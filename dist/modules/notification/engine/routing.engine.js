"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingEngine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RoutingEngine {
    async getProvidersForChannel(organizationId, channel) {
        let providers = await prisma.notificationProvider.findMany({
            where: {
                organizationId,
                isActive: true,
            },
            orderBy: {
                priority: 'asc',
            },
        });
        if (providers.length === 0) {
            providers = await prisma.notificationProvider.findMany({
                where: {
                    organizationId: null,
                    isActive: true,
                },
                orderBy: {
                    priority: 'asc',
                },
            });
        }
        const channelProviderMap = {
            EMAIL: ['SMTP', 'SENDGRID', 'SES'],
            SMS: ['TWILIO'],
            WHATSAPP: ['WHATSAPP'],
            PUSH: ['FCM'],
            SLACK: ['SLACK'],
            MS_TEAMS: ['SLACK'],
            DISCORD: ['DISCORD'],
            WEBHOOK: ['WEBHOOK'],
            IN_APP: ['INAPP']
        };
        const allowedTypes = channelProviderMap[channel] || [];
        return providers.filter(p => allowedTypes.includes(p.type));
    }
}
exports.RoutingEngine = RoutingEngine;
