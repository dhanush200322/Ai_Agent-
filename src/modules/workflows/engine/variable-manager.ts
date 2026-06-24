import { VariableScope } from '../types/workflow.types';

export class VariableManager {
  private scope: VariableScope;

  constructor(initialScope?: Partial<VariableScope>) {
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

  setExecutionVariable(key: string, value: any) {
    this.scope.execution[key] = value;
  }

  setNodeOutput(nodeId: string, output: Record<string, any>) {
    this.scope.outputs[nodeId] = output;
  }

  // Very basic template resolution e.g. {{execution.userId}} or {{outputs.node1.result}}
  resolveString(template: string): string {
    if (!template) return template;
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.resolvePath(path.trim());
      return value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : match;
    });
  }

  resolveObject(obj: any): any {
    if (typeof obj === 'string') return this.resolveString(obj);
    if (Array.isArray(obj)) return obj.map(v => this.resolveObject(v));
    if (obj !== null && typeof obj === 'object') {
      const res: any = {};
      for (const [k, v] of Object.entries(obj)) {
        res[k] = this.resolveObject(v);
      }
      return res;
    }
    return obj;
  }

  private resolvePath(path: string): any {
    const parts = path.split('.');
    let current: any = this.scope;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }
}
