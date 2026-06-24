import { EventEmitter } from 'events';

class WorkflowEventEmitter extends EventEmitter {}

export const workflowEvents = new WorkflowEventEmitter();

// Register default listeners for auditing/logging
workflowEvents.on('workflow:started', ({ executionId, workflowId }) => {
  console.log(`[WorkflowEvent] Started execution: ${executionId} (Workflow: ${workflowId})`);
});

workflowEvents.on('workflow:completed', ({ executionId }) => {
  console.log(`[WorkflowEvent] Completed execution: ${executionId}`);
});

workflowEvents.on('workflow:failed', ({ executionId, error }) => {
  console.error(`[WorkflowEvent] Failed execution: ${executionId}, Error: ${error}`);
});
