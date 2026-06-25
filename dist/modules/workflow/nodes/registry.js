"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalNodeRegistry = exports.NodeRegistry = void 0;
class NodeRegistry {
    nodes = new Map();
    register(node) {
        this.nodes.set(node.type, node);
        console.log(`[NodeRegistry] Registered node type: ${node.type}`);
    }
    lookup(type) {
        const node = this.nodes.get(type);
        if (!node) {
            throw new Error(`Node type '${type}' is not registered in the NodeRegistry.`);
        }
        return node;
    }
    resolve(type) {
        return this.lookup(type);
    }
    async execute(type, node, context) {
        const executor = this.lookup(type);
        // Call validation before execution
        const errors = executor.validate(node);
        if (errors && errors.length > 0) {
            return {
                status: 'FAILED',
                error: `Validation failed: ${errors.join(', ')}`
            };
        }
        return executor.execute(node, context);
    }
    getRegisteredTypes() {
        return Array.from(this.nodes.keys());
    }
}
exports.NodeRegistry = NodeRegistry;
exports.globalNodeRegistry = new NodeRegistry();
