"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const client_1 = require("@prisma/client");
const types_1 = require("../types");
class SchedulerService {
    manager;
    constructor(manager) {
        this.manager = manager;
    }
    async scheduleCron(_jobId, cron, payload) {
        await this.manager.enqueue({ queueName: types_1.StandardQueueName.SCHEDULER, type: client_1.JobType.WORKFLOW, payload, repeat: { pattern: cron } });
    }
    async cancelJob(_queueName, _jobId) {
        // Implementation
    }
}
exports.SchedulerService = SchedulerService;
