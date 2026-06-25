"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionContext = void 0;
const tool_resolver_service_1 = require("../../tools/services/tool-resolver.service");
const tool_executor_service_1 = require("../../tools/services/tool-executor.service");
const planner_service_1 = require("../../tools/services/planner.service");
const groq_service_1 = require("../../chat/services/groq.service");
class WorkflowExecutionContext {
    workflow;
    version;
    execution;
    organization;
    agent;
    definition;
    variables;
    // Reusable Shared Services
    toolResolver;
    toolExecutor;
    planner;
    llm;
    constructor(args) {
        this.workflow = args.workflow;
        this.version = args.version;
        this.execution = args.execution;
        this.organization = args.organization;
        this.agent = args.agent;
        this.definition = args.definition;
        this.variables = args.variableManager;
        this.toolResolver = new tool_resolver_service_1.ToolResolverService();
        this.toolExecutor = new tool_executor_service_1.ToolExecutorService();
        this.planner = new planner_service_1.PlannerService();
        this.llm = new groq_service_1.GroqService();
    }
}
exports.WorkflowExecutionContext = WorkflowExecutionContext;
