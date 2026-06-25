"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationWorker = void 0;
class NotificationWorker {
    async process(job) {
        const { userId, type, payload } = job.data;
        // Send notifications like 'New login from unknown device'
        console.log(`Processing notification for user ${userId}: ${type}`);
    }
}
exports.NotificationWorker = NotificationWorker;
