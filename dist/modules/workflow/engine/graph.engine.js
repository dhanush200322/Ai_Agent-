"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphEngine = void 0;
class GraphEngine {
    /**
     * Checks if the graph is a Directed Acyclic Graph (contains no cycles).
     */
    hasCycle(definition) {
        const adj = this.buildAdjacencyList(definition);
        const visited = new Set();
        const recStack = new Set();
        for (const node of definition.nodes) {
            if (this.dfsHasCycle(node.id, adj, visited, recStack)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Helper DFS to detect cycles
     */
    dfsHasCycle(nodeId, adj, visited, recStack) {
        if (recStack.has(nodeId))
            return true;
        if (visited.has(nodeId))
            return false;
        visited.add(nodeId);
        recStack.add(nodeId);
        const neighbors = adj.get(nodeId) || [];
        for (const neighbor of neighbors) {
            if (this.dfsHasCycle(neighbor, adj, visited, recStack)) {
                return true;
            }
        }
        recStack.delete(nodeId);
        return false;
    }
    /**
     * Topological sorting of nodes for linear order validation.
     */
    topologicalSort(definition) {
        const adj = this.buildAdjacencyList(definition);
        const visited = new Set();
        const stack = [];
        for (const node of definition.nodes) {
            if (!visited.has(node.id)) {
                this.dfsSort(node.id, adj, visited, stack);
            }
        }
        return stack.reverse();
    }
    dfsSort(nodeId, adj, visited, stack) {
        visited.add(nodeId);
        const neighbors = adj.get(nodeId) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                this.dfsSort(neighbor, adj, visited, stack);
            }
        }
        stack.push(nodeId);
    }
    /**
     * Find branches of nodes executing in parallel.
     */
    findParallelBranches(definition) {
        // Basic detection: nodes sharing the same parent that trigger concurrently
        const parentMap = new Map();
        for (const edge of definition.edges) {
            if (!parentMap.has(edge.source)) {
                parentMap.set(edge.source, []);
            }
            parentMap.get(edge.source).push(edge.target);
        }
        const parallelBranches = [];
        for (const [source, targets] of parentMap.entries()) {
            if (targets.length > 1) {
                parallelBranches.push(targets);
            }
        }
        return parallelBranches;
    }
    buildAdjacencyList(definition) {
        const adj = new Map();
        for (const node of definition.nodes) {
            adj.set(node.id, []);
        }
        for (const edge of definition.edges) {
            if (adj.has(edge.source)) {
                adj.get(edge.source).push(edge.target);
            }
        }
        return adj;
    }
}
exports.GraphEngine = GraphEngine;
