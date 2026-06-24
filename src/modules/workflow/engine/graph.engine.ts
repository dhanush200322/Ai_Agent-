import { WorkflowDefinition, WorkflowNodeData, WorkflowEdgeData } from '../types';

export class GraphEngine {
  
  /**
   * Checks if the graph is a Directed Acyclic Graph (contains no cycles).
   */
  hasCycle(definition: WorkflowDefinition): boolean {
    const adj = this.buildAdjacencyList(definition);
    const visited = new Set<string>();
    const recStack = new Set<string>();

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
  private dfsHasCycle(
    nodeId: string,
    adj: Map<string, string[]>,
    visited: Set<string>,
    recStack: Set<string>
  ): boolean {
    if (recStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

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
  topologicalSort(definition: WorkflowDefinition): string[] {
    const adj = this.buildAdjacencyList(definition);
    const visited = new Set<string>();
    const stack: string[] = [];

    for (const node of definition.nodes) {
      if (!visited.has(node.id)) {
        this.dfsSort(node.id, adj, visited, stack);
      }
    }

    return stack.reverse();
  }

  private dfsSort(
    nodeId: string,
    adj: Map<string, string[]>,
    visited: Set<string>,
    stack: string[]
  ) {
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
  findParallelBranches(definition: WorkflowDefinition): string[][] {
    // Basic detection: nodes sharing the same parent that trigger concurrently
    const parentMap = new Map<string, string[]>();
    for (const edge of definition.edges) {
      if (!parentMap.has(edge.source)) {
        parentMap.set(edge.source, []);
      }
      parentMap.get(edge.source)!.push(edge.target);
    }

    const parallelBranches: string[][] = [];
    for (const [source, targets] of parentMap.entries()) {
      if (targets.length > 1) {
        parallelBranches.push(targets);
      }
    }
    return parallelBranches;
  }

  private buildAdjacencyList(definition: WorkflowDefinition): Map<string, string[]> {
    const adj = new Map<string, string[]>();
    for (const node of definition.nodes) {
      adj.set(node.id, []);
    }
    for (const edge of definition.edges) {
      if (adj.has(edge.source)) {
        adj.get(edge.source)!.push(edge.target);
      }
    }
    return adj;
  }
}
