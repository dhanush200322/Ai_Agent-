"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultNotificationDispatcher = void 0;
class DefaultNotificationDispatcher {
    async dispatch(_channelConfig, subject, _message, severity) {
        // JSON.parse(channelConfig || '{}'); // ignoring config for now
        // Abstracting actual delivery. 
        // Example: if (config.type === 'WEBHOOK') fetch(config.url, ...)
        console.log(`[NotificationDispatcher] Sent ${severity} Alert: ${subject}`);
        return true;
    }
}
exports.DefaultNotificationDispatcher = DefaultNotificationDispatcher;
