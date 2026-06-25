"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerWorker = void 0;
const planning_engine_1 = require("../engine/planning.engine");
const monitoring_engine_1 = require("../engine/monitoring.engine");
const planningEngine = new planning_engine_1.PlanningEngine();
const monitoringEngine = new monitoring_engine_1.MonitoringEngine();
class PlannerWorker {
    async processJob(job) {
        const { executionId, goal, context, organizationId } = job.data;
        try {
            const plan = await planningEngine.generatePlan(goal, context);
            await monitoringEngine.logEvent(executionId, 'INFO', 'Plan generated', { plan });
            return plan;
        }
        catch (error) {
            await monitoringEngine.logEvent(executionId, 'ERROR', 'Plan generation failed', { error: error.message });
            throw error;
        }
    }
}
exports.PlannerWorker = PlannerWorker;
