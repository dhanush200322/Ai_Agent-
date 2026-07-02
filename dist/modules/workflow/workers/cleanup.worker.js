"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupWorker = void 0;
const prisma_1 = require("../../../shared/prisma");
const CleanupWorker = async (job, _context) => {
    await job.log('Starting execution logs cleanup...');
    // Clean up completed executions older than 30 days
    const thresholdDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const deletedLogs = await prisma_1.prisma.workflowExecution.deleteMany({
        where: {
            status: 'COMPLETED',
            finishedAt: { lt: thresholdDate }
        }
    });
    await job.log(`Cleaned up ${deletedLogs.count} historical executions.`);
    await job.updateProgress(100);
};
exports.CleanupWorker = CleanupWorker;
