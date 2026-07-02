"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppProvider = void 0;
const prisma_1 = require("../../../shared/prisma");
class InAppProvider {
    config = null;
    constructor(config) {
        this.config = config;
    }
    async send(options) {
        const startTime = Date.now();
        try {
            if (this.config?.simulateFailure || options.recipient.includes('fail')) {
                throw new Error('In-App Notification delivery failed');
            }
            const notificationId = options.metadata?.notificationId;
            if (notificationId) {
                await prisma_1.prisma.notification.update({
                    where: { id: notificationId },
                    data: { status: 'SENT', sentAt: new Date() }
                });
            }
            return {
                success: true,
                deliveryId: `inapp-${Math.random().toString(36).substring(2, 11)}`,
                latency: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error.message,
                latency: Date.now() - startTime,
            };
        }
    }
    validate(config) {
        return true;
    }
    async health() {
        return true;
    }
    async status() {
        return 'ACTIVE';
    }
}
exports.InAppProvider = InAppProvider;
