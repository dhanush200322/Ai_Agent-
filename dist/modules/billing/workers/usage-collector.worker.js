"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageCollectorWorker = void 0;
const metering_engine_1 = require("../engine/metering.engine");
const quota_engine_1 = require("../engine/quota.engine");
class UsageCollectorWorker {
    meteringEngine;
    quotaEngine;
    constructor() {
        this.meteringEngine = new metering_engine_1.MeteringEngine();
        this.quotaEngine = new quota_engine_1.QuotaEngine();
    }
    async process(job) {
        const { organizationId, type, quantity, metadata } = job.payload.payload;
        // 1. Persist immutable UsageEvent for billing aggregation
        await this.meteringEngine.recordUsageEvent(organizationId, type, quantity, metadata);
        // 2. Increment fast Redis Quota Engine counter
        await this.quotaEngine.recordUsage(organizationId, type, quantity);
    }
}
exports.UsageCollectorWorker = UsageCollectorWorker;
