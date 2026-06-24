import { GraphEngine } from './graph.engine';
import { ExecutionEngine } from './execution.engine';
import { ValidationEngine } from './validation.engine';
import { VersionEngine } from './version.engine';
import { TemplateEngine } from './template.engine';
import { SchedulerEngine } from './scheduler.engine';
import { ApprovalEngine } from './approval.engine';
import { RollbackEngine } from './rollback.engine';
import { DebuggerEngine } from './debugger.engine';

export class WorkflowEngine {
  public graph = new GraphEngine();
  public execution = new ExecutionEngine();
  public validation = new ValidationEngine();
  public version = new VersionEngine();
  public template = new TemplateEngine();
  public scheduler = new SchedulerEngine();
  public approval = new ApprovalEngine();
  public rollback = new RollbackEngine();
  public debugger = new DebuggerEngine();
}

export const globalWorkflowEngine = new WorkflowEngine();
