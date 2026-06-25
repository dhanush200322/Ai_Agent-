"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmediateDispatcher = void 0;
const runner_1 = require("./runner");
class ImmediateDispatcher {
    runner = new runner_1.WorkflowRunner();
    async dispatch(context, startNodeId) {
        // In a real queue like BullMQ, we would push a job here.
        // For immediate execution, we just run it inline.
        await this.runner.run(context, startNodeId);
    }
    async resume(context, nodeId, approvalData) {
        await this.runner.resumeNode(context, nodeId, approvalData);
    }
}
exports.ImmediateDispatcher = ImmediateDispatcher;
