"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionContext = exports.VariableManager = void 0;
const vault_service_1 = require("../../vault/services/vault.service");
const tool_resolver_service_1 = require("../../tools/services/tool-resolver.service");
const tool_executor_service_1 = require("../../tools/services/tool-executor.service");
const planner_service_1 = require("../../tools/services/planner.service");
const groq_service_1 = require("../../chat/services/groq.service");
const vaultService = new vault_service_1.VaultService();
class VariableManager {
    scope;
    orgId;
    constructor(orgId, initialScope) {
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
    getScope() {
        return this.scope;
    }
    getScopeWithoutSecrets() {
        return {
            ...this.scope,
            secrets: {} // Clear secrets to prevent logging them
        };
    }
    setExecutionVariable(key, value) {
        this.scope.execution[key] = value;
    }
    setNodeOutput(nodeId, output) {
        this.scope.outputs[nodeId] = output;
    }
    // Load a secret dynamically from the vault when needed
    async getSecret(secretName) {
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
        }
        catch (e) {
            console.error(`Failed to retrieve secret ${secretName} from Vault:`, e);
        }
        return '';
    }
    async resolveString(template) {
        if (!template)
            return template;
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
    async resolveObject(obj) {
        if (typeof obj === 'string')
            return this.resolveString(obj);
        if (Array.isArray(obj)) {
            const resolved = [];
            for (const v of obj) {
                resolved.push(await this.resolveObject(v));
            }
            return resolved;
        }
        if (obj !== null && typeof obj === 'object') {
            const res = {};
            for (const [k, v] of Object.entries(obj)) {
                res[k] = await this.resolveObject(v);
            }
            return res;
        }
        return obj;
    }
    async resolvePath(path) {
        const parts = path.split('.');
        // Special intercept for secrets: load dynamically from Vault
        if (parts[0] === 'secrets' && parts.length > 1) {
            return this.getSecret(parts[1]);
        }
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
