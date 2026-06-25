"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsensusService = void 0;
class ConsensusService {
    /**
     * Aggregates the results of multiple subtasks into a cohesive response.
     */
    async aggregate(_parentTask, subtasks, strategy) {
        if (subtasks.length === 0)
            return 'No subtasks executed.';
        const failedTasks = subtasks.filter(t => t.status === 'FAILED');
        const completedTasks = subtasks.filter(t => t.status === 'COMPLETED');
        if (strategy === 'STRICT' && failedTasks.length > 0) {
            throw new Error(`Consensus failed (STRICT): ${failedTasks.length} tasks failed.`);
        }
        if (strategy === 'BEST_EFFORT') {
            if (completedTasks.length === 0) {
                throw new Error('Consensus failed (BEST_EFFORT): All tasks failed.');
            }
            return this.formatOutputs(completedTasks);
        }
        if (strategy === 'MAJORITY') {
            // Simplistic representation: if more than 50% succeeded, return aggregated.
            if (completedTasks.length <= subtasks.length / 2) {
                throw new Error('Consensus failed (MAJORITY): Failed to reach >50% completion.');
            }
            return this.formatOutputs(completedTasks);
        }
        if (strategy === 'MANAGER_OVERRIDE') {
            // In a real system, this would prompt a Manager Agent LLM to review the partial outputs and decide.
            // For this implementation, we just return whatever is available, appending failure notices.
            return `[Manager Review Auto-Approved]\n${this.formatOutputs(subtasks)}`;
        }
        return this.formatOutputs(completedTasks);
    }
    formatOutputs(tasks) {
        return tasks.map((t, idx) => `--- Task ${idx + 1} (${t.status}) ---\n${t.output || 'No Output'}`).join('\n\n');
    }
}
exports.ConsensusService = ConsensusService;
