"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalWorkflowEngine = exports.WorkflowEngine = void 0;
const graph_engine_1 = require("./graph.engine");
const execution_engine_1 = require("./execution.engine");
const validation_engine_1 = require("./validation.engine");
const version_engine_1 = require("./version.engine");
const template_engine_1 = require("./template.engine");
const scheduler_engine_1 = require("./scheduler.engine");
const approval_engine_1 = require("./approval.engine");
const rollback_engine_1 = require("./rollback.engine");
const debugger_engine_1 = require("./debugger.engine");
class WorkflowEngine {
    graph = new graph_engine_1.GraphEngine();
    execution = new execution_engine_1.ExecutionEngine();
    validation = new validation_engine_1.ValidationEngine();
    version = new version_engine_1.VersionEngine();
    template = new template_engine_1.TemplateEngine();
    scheduler = new scheduler_engine_1.SchedulerEngine();
    approval = new approval_engine_1.ApprovalEngine();
    rollback = new rollback_engine_1.RollbackEngine();
    debugger = new debugger_engine_1.DebuggerEngine();
}
exports.WorkflowEngine = WorkflowEngine;
exports.globalWorkflowEngine = new WorkflowEngine();
