import { Workflow, WorkflowVersion, WorkflowExecution, Organization, Agent } from '@prisma/client';
import { VariableManager } from './variable-manager';
import { WorkflowDefinition } from '../types/workflow.types';
import { ToolResolverService } from '../../tools/services/tool-resolver.service';
import { ToolExecutorService } from '../../tools/services/tool-executor.service';
import { PlannerService } from '../../tools/services/planner.service';
import { GroqService } from '../../chat/services/groq.service';

export interface WorkflowExecutionContextArgs {
  workflow: Workflow;
  version: WorkflowVersion;
  execution: WorkflowExecution;
  organization: Organization;
  agent?: Agent;
  definition: WorkflowDefinition;
  variableManager: VariableManager;
}

export class WorkflowExecutionContext {
  public workflow: Workflow;
  public version: WorkflowVersion;
  public execution: WorkflowExecution;
  public organization: Organization;
  public agent?: Agent;
  public definition: WorkflowDefinition;
  public variables: VariableManager;

  // Reusable Shared Services
  public toolResolver: ToolResolverService;
  public toolExecutor: ToolExecutorService;
  public planner: PlannerService;
  public llm: GroqService;

  constructor(args: WorkflowExecutionContextArgs) {
    this.workflow = args.workflow;
    this.version = args.version;
    this.execution = args.execution;
    this.organization = args.organization;
    this.agent = args.agent;
    this.definition = args.definition;
    this.variables = args.variableManager;

    this.toolResolver = new ToolResolverService();
    this.toolExecutor = new ToolExecutorService();
    this.planner = new PlannerService();
    this.llm = new GroqService();
  }
}
