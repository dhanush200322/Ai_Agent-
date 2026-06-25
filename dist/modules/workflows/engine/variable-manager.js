"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableManager = void 0;
class VariableManager {
    scope;
    constructor(initialScope) {
        this.scope = {
            workflow: initialScope?.workflow || {},
            execution: initialScope?.execution || {},
            environment: initialScope?.environment || {},
            agent: initialScope?.agent || {},
            secrets: initialScope?.secrets || {},
            outputs: initialScope?.outputs || {}
        };
    }
    getScope() {
        return this.scope;
    }
    setExecutionVariable(key, value) {
        this.scope.execution[key] = value;
    }
    setNodeOutput(nodeId, output) {
        this.scope.outputs[nodeId] = output;
    }
    // Very basic template resolution e.g. {{execution.userId}} or {{outputs.node1.result}}
    resolveString(template) {
        if (!template)
            return template;
        return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const value = this.resolvePath(path.trim());
            return value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : match;
        });
    }
    resolveObject(obj) {
        if (typeof obj === 'string')
            return this.resolveString(obj);
        if (Array.isArray(obj))
            return obj.map(v => this.resolveObject(v));
        if (obj !== null && typeof obj === 'object') {
            const res = {};
            for (const [k, v] of Object.entries(obj)) {
                res[k] = this.resolveObject(v);
            }
            return res;
        }
        return obj;
    }
    resolvePath(path) {
        const parts = path.split('.');
        let current = this.scope;
        for (const part of parts) {
            if (current === undefined || current === null)
                return undefined;
            current = current[part];
        }
        return current;
    }
}
exports.VariableManager = VariableManager;
