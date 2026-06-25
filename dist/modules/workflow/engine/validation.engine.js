"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationEngine = void 0;
const registry_1 = require("../nodes/registry");
class ValidationEngine {
    /**
     * Validates a workflow graph definition.
     */
    validateDefinition(definition) {
        const errors = [];
        if (!definition.nodes || definition.nodes.length === 0) {
            errors.push('Workflow must contain at least one node.');
            return errors;
        }
        // Validate nodes
        for (const node of definition.nodes) {
            if (!node.id) {
                errors.push('All nodes must have an ID.');
                continue;
            }
            if (!node.type) {
                errors.push(`Node '${node.id}' must have a type.`);
                continue;
            }
            // Verify node type registry
            try {
                const executor = registry_1.globalNodeRegistry.resolve(node.type);
                const nodeErrors = executor.validate(node);
                if (nodeErrors && nodeErrors.length > 0) {
                    errors.push(`Node '${node.id}' (${node.type}) configuration errors: ${nodeErrors.join(', ')}`);
                }
            }
            catch (e) {
                errors.push(`Node '${node.id}' refers to unregistered type '${node.type}': ${e.message}`);
            }
        }
        // Validate edges
        const nodeIds = new Set(definition.nodes.map(n => n.id));
        if (definition.edges) {
            for (const edge of definition.edges) {
                if (!edge.source || !edge.target) {
                    errors.push(`Edges must have both a source and target.`);
                    continue;
                }
                if (!nodeIds.has(edge.source)) {
                    errors.push(`Edge connects from non-existent node: '${edge.source}'.`);
                }
                if (!nodeIds.has(edge.target)) {
                    errors.push(`Edge connects to non-existent node: '${edge.target}'.`);
                }
            }
        }
        return errors;
    }
    /**
     * Validates RBAC permissions for a user accessing a resource/workflow.
     */
    validateRbac(user, action, resource = 'workflow') {
        if (!user || !user.permissions)
            return false;
        // Admin/Owner roles bypass checks or have wildcard permissions
        if (user.permissions.includes('*') || user.permissions.includes('admin') || user.permissions.includes('owner')) {
            return true;
        }
        const requiredPermission = `${resource}:${action}`;
        return user.permissions.includes(requiredPermission);
    }
}
exports.ValidationEngine = ValidationEngine;
