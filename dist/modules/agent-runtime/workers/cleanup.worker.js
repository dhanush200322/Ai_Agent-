"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupWorker = void 0;
const prisma_1 = require("../../../shared/prisma");
class CleanupWorker {
    async processJob(job) {
        const { retentionDays } = job.data;
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - (retentionDays || 30));
        try {
            const deleted = await prisma_1.prisma.agentExecutionLog.deleteMany({
                where: { createdAt: { lt: dateThreshold } }
            });
            return { deletedLogs: deleted.count };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.CleanupWorker = CleanupWorker;
