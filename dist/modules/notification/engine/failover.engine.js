"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailoverEngine = void 0;
class FailoverEngine {
    getFallbackProviderType(failedType) {
        const chain = {
            SMTP: 'SENDGRID',
            SENDGRID: 'SES',
            SES: null,
            TWILIO: null,
            WHATSAPP: null,
            SLACK: null,
            DISCORD: null,
            WEBHOOK: null,
            FCM: null,
            INAPP: null
        };
        return chain[failedType] || null;
    }
}
exports.FailoverEngine = FailoverEngine;
