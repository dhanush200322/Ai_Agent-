"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditWorker = void 0;
class AuditWorker {
    async process(job) {
        const { sessionId, userId, action } = job.data;
        // Simulate updating an Observability / SIEM / Audit log stream
        console.log(`[Queue: Audit] Processed audit for ${action} - User: ${userId}, Session: ${sessionId}`);
    }
}
exports.AuditWorker = AuditWorker;
