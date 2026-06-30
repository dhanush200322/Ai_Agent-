'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflow, useUpdateWorkflow, usePublishWorkflow, useExecuteWorkflow } from '../hooks/useWorkflows';
import { SUPPORTED_NODES } from '../config/nodeRegistry';
import CustomNode from './nodes/CustomNode';
import NodeConfigPanel from './NodeConfigPanel';
import WorkflowActions from './WorkflowActions';

export default function WorkflowCanvas({ workflowId }: { workflowId: string }) {
  const { data: workflow, isLoading } = useWorkflow(workflowId);
  const updateMutation = useUpdateWorkflow(workflowId);
  const publishMutation = usePublishWorkflow(workflowId);
  const executeMutation = useExecuteWorkflow(workflowId);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Custom Node Types mapping
  const nodeTypes = useMemo(() => {
    const types: Record<string, any> = {};
    SUPPORTED_NODES.forEach(def => {
      types[def.type] = CustomNode;
    });
    return types;
  }, []);

  // Load existing workflow version data
  useEffect(() => {
    if (workflow) {
      // Find the latest draft version, or just the active one if no draft
      const version = workflow.versions?.[0]; // Assuming versions are ordered
      if (version && version.nodes) {
        setNodes(version.nodes);
        setEdges(version.connections);
      }
    }
  }, [workflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: event.clientX - 300, // Adjust for sidebar offset if needed
        y: event.clientY - 100,
      };

      const def = SUPPORTED_NODES.find(n => n.type === type);

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { 
          label: def?.label || type, 
          config: { ...def?.defaultConfig }
        },
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [setNodes],
  );

  const handleSave = () => {
    // Send exact JSON back to update
    updateMutation.mutate({
      nodes,
      connections: edges
    });
  };

  const selectedNode = nodes.find((n: Node) => n.id === selectedNodeId);

  const updateNodeData = (id: string, data: any) => {
    setNodes((nds: Node[]) => nds.map((n: Node) => {
      if (n.id === id) {
        return { ...n, data: { ...n.data, ...data } };
      }
      return n;
    }));
  };

  if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading Canvas...</div>;

  return (
    <div className="flex w-full h-[calc(100vh-80px)] overflow-hidden bg-zinc-950 relative">
      {/* Node Library Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col gap-4 overflow-y-auto z-10">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Node Library</h3>
        {SUPPORTED_NODES.map(node => (
          <div 
            key={node.type}
            className={`p-3 rounded-xl border cursor-grab hover:-translate-y-0.5 transition-transform bg-zinc-950 flex flex-col gap-2 ${node.color}`}
            onDragStart={(event) => {
              event.dataTransfer.setData('application/reactflow', node.type);
              event.dataTransfer.effectAllowed = 'move';
            }}
            draggable
          >
            <div className="flex items-center gap-2">
              <node.icon className="w-4 h-4" />
              <span className="font-medium text-sm text-white">{node.label}</span>
            </div>
            <p className="text-xs text-zinc-500 line-clamp-2">{node.description}</p>
          </div>
        ))}
      </div>

      {/* Main Canvas */}
      <div className="flex-1 h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(e, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          className="bg-zinc-950"
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#3f3f46" />
          <MiniMap 
            className="bg-zinc-900 border-zinc-800" 
            maskColor="rgba(0,0,0,0.5)"
            nodeColor="#3f3f46"
          />
          <Controls className="bg-zinc-900 border-zinc-800 text-white fill-white" />
          
          <Panel position="top-right" className="flex gap-2">
            <WorkflowActions 
              onSave={handleSave} 
              onPublish={() => publishMutation.mutate('latest')} 
              onExecute={() => executeMutation.mutate({})}
              isSaving={updateMutation.isPending}
            />
          </Panel>
        </ReactFlow>
      </div>

      {/* Configuration Panel */}
      {selectedNode && (
        <NodeConfigPanel 
          node={selectedNode}
          onChange={(data) => updateNodeData(selectedNode.id, data)}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
