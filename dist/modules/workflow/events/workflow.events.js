"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowEvents = void 0;
const events_1 = require("events");
class WorkflowEventEmitter extends events_1.EventEmitter {
}
exports.workflowEvents = new WorkflowEventEmitter();
// Register default listeners for auditing/logging
exports.workflowEvents.on('workflow:started', ({ executionId, workflowId }) => {
    console.log(`[WorkflowEvent] Started execution: ${executionId} (Workflow: ${workflowId})`);
});
exports.workflowEvents.on('workflow:completed', ({ executionId }) => {
    console.log(`[WorkflowEvent] Completed execution: ${executionId}`);
});
exports.workflowEvents.on('workflow:failed', ({ executionId, error }) => {
    console.error(`[WorkflowEvent] Failed execution: ${executionId}, Error: ${error}`);
});
