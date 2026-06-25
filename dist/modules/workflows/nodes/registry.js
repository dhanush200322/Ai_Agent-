"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalNodeRegistry = exports.NodeRegistry = void 0;
class NodeRegistry {
    nodes = new Map();
    register(node) {
        this.nodes.set(node.type, node);
    }
    resolve(type) {
        const node = this.nodes.get(type);
        if (!node) {
            throw new Error(`Node type ${type} is not registered in the NodeRegistry`);
        }
        return node;
    }
    getRegisteredTypes() {
        return Array.from(this.nodes.keys());
    }
}
exports.NodeRegistry = NodeRegistry;
exports.globalNodeRegistry = new NodeRegistry();
