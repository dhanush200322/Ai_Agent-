import { Workflow, WorkflowVersion, WorkflowExecution, Organization, Agent } from '@prisma/client';
import { WorkflowDefinition, VariableScope } from '../types';
import { VaultService } from '../../vault/services/vault.service';

import { ToolResolverService } from '../../tools/services/tool-resolver.service';
import { ToolExecutorService } from '../../tools/services/tool-executor.service';
import { PlannerService } from '../../tools/services/planner.service';
import { GroqService } from '../../chat/services/groq.service';

const vaultService = new VaultService();

export class VariableManager {
  private scope: VariableScope;
  private orgId: string;

  constructor(orgId: string, initialScope?: Partial<VariableScope>) {
    this.orgId = orgId;
    this.scope = {
      workflow: initialScope?.workflow || {},
      execution: initialScope?.execution || {},
      environment: initialScope?.environment || {},
      agent: initialScope?.agent || {},
      secrets: initialScope?.secrets || {},
      outputs: initialScope?.outputs || {}
    };
  }

  getScope(): VariableScope {
    return this.scope;
  }

  getScopeWithoutSecrets(): VariableScope {
    return {
      ...this.scope,
      secrets: {} // Clear secrets to prevent logging them
    };
  }

  setExecutionVariable(key: string, value: any) {
    this.scope.execution[key] = value;
  }

  setNodeOutput(nodeId: string, output: Record<string, any>) {
    this.scope.outputs[nodeId] = output;
  }

  // Load a secret dynamically from the vault when needed
  async getSecret(secretName: string): Promise<string> {
    if (this.scope.secrets[secretName]) {
      return this.scope.secrets[secretName];
    }
    try {
      const secrets = await vaultService.listSecrets(this.orgId);
      const secret = secrets.find(s => s.name === secretName);
      if (secret) {
        const val = await vaultService.retrieveSecret(secret.id, '00000000-0000-0000-0000-000000000000', 'SYSTEM');
        if (val) {
          this.scope.secrets[secretName] = val;
          return val;
        }
      }
    } catch (e) {
      console.error(`Failed to retrieve secret ${secretName} from Vault:`, e);
    }
    return '';
  }

  async resolveString(template: string): Promise<string> {
    if (!template) return template;
    
    // Find all occurrences of {{...}}
    const regex = /\{\{([^}]+)\}\}/g;
    let match;
    let result = template;
    
    // We do a sequential replacement to support async secret loading
    while ((match = regex.exec(template)) !== null) {
      const path = match[1].trim();
      let value = await this.resolvePath(path);
      
      const toReplace = match[0];
      const replacement = value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : toReplace;
      result = result.replace(toReplace, replacement);
    }
    
    return result;
  }

  async resolveObject(obj: any): Promise<any> {
    if (typeof obj === 'string') return this.resolveString(obj);
    if (Array.isArray(obj)) {
      const resolved = [];
      for (const v of obj) {
        resolved.push(await this.resolveObject(v));
      }
      return resolved;
    }
    if (obj !== null && typeof obj === 'object') {
      const res: any = {};
      for (const [k, v] of Object.entries(obj)) {
        res[k] = await this.resolveObject(v);
      }
      return res;
    }
    return obj;
  }

  private async resolvePath(path: string): Promise<any> {
    const parts = path.split('.');
    
    // Special intercept for secrets: load dynamically from Vault
    if (parts[0] === 'secrets' && parts.length > 1) {
      return this.getSecret(parts[1]);
    }
    
    let current: any = this.scope;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }
}

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
