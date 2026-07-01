'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  Panel,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

import { useWorkflow, useUpdateWorkflow, usePublishWorkflow, useExecuteWorkflow } from '../hooks/useWorkflows';
import { SUPPORTED_NODES } from '../config/nodeRegistry';
import CustomNode from './nodes/CustomNode';
import NodeConfigPanel from './NodeConfigPanel';
import WorkflowActions from './WorkflowActions';
import ContextMenu from './ContextMenu';
import { useHistory } from '../hooks/useHistory';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 320;
const nodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'TB' ? 'top' : 'left' as any;
    node.sourcePosition = direction === 'TB' ? 'bottom' : 'right' as any;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

function Flow({ workflowId }: { workflowId: string }) {
  const { data: workflow, isLoading } = useWorkflow(workflowId);
  const updateMutation = useUpdateWorkflow(workflowId);
  const publishMutation = usePublishWorkflow(workflowId);
  const executeMutation = useExecuteWorkflow(workflowId);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { takeSnapshot, undo, redo, canUndo, canRedo } = useHistory([], []);
  const { screenToFlowPosition, fitView } = useReactFlow();

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
      const version = workflow.versions?.[0];
      if (version && version.nodes) {
        setNodes(version.nodes);
        setEdges(version.connections);
        takeSnapshot(version.nodes, version.connections);
      }
    }
  }, [workflow, setNodes, setEdges, takeSnapshot]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      takeSnapshot(nodes, edges);
    },
    [setEdges, nodes, edges, takeSnapshot],
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

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

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
      takeSnapshot([...nodes, newNode], edges);
    },
    [screenToFlowPosition, setNodes, nodes, edges, takeSnapshot],
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const pane = ref.current?.getBoundingClientRect();
      if (!pane) return;

      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom: event.clientY >= pane.height - 200 && pane.height - event.clientY,
      } as any);
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
    setSelectedNodeId(null);
  }, []);

  const duplicateNode = useCallback((id: string) => {
    const nodeToDuplicate = nodes.find(n => n.id === id);
    if (!nodeToDuplicate) return;

    const newNode = {
      ...nodeToDuplicate,
      id: `node_${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      selected: false,
    };
    
    setNodes(nds => nds.concat(newNode));
    takeSnapshot([...nodes, newNode], edges);
    setMenu(null);
  }, [nodes, edges, setNodes, takeSnapshot]);

  const deleteNode = useCallback((id: string) => {
    const newNodes = nodes.filter(n => n.id !== id);
    const newEdges = edges.filter(e => e.source !== id && e.target !== id);
    setNodes(newNodes);
    setEdges(newEdges);
    takeSnapshot(newNodes, newEdges);
    setMenu(null);
  }, [nodes, edges, setNodes, setEdges, takeSnapshot]);

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    takeSnapshot(layoutedNodes, layoutedEdges);
    window.setTimeout(() => fitView(), 50);
  }, [nodes, edges, setNodes, setEdges, fitView, takeSnapshot]);

  const handleSave = () => {
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
    takeSnapshot(nodes, edges); // Might want to debounce this
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const prev = undo(nodes, edges);
        if (prev) { setNodes(prev.nodes); setEdges(prev.edges); }
      }
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        const next = redo(nodes, edges);
        if (next) { setNodes(next.nodes); setEdges(next.edges); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, undo, redo, setNodes, setEdges]);

  if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading Canvas...</div>;

  return (
    <div className="flex w-full h-[calc(100vh-80px)] overflow-hidden bg-zinc-950 relative" ref={ref}>
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
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          fitView
          className="bg-zinc-950"
          defaultEdgeOptions={{ animated: true, type: 'smoothstep' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#3f3f46" />
          <MiniMap 
            className="bg-zinc-900 border-zinc-800 rounded-lg shadow-xl m-4" 
            maskColor="rgba(0,0,0,0.5)"
            nodeColor="#3f3f46"
          />
          <Controls className="bg-zinc-900 border-zinc-800 text-white fill-white rounded-lg shadow-xl m-4" />
          
          <Panel position="top-right" className="flex gap-2 p-4">
            <WorkflowActions 
              onSave={handleSave} 
              onPublish={() => publishMutation.mutate('latest')} 
              onExecute={(vars) => executeMutation.mutate({ variables: vars })}
              isSaving={updateMutation.isPending}
              nodes={nodes}
              edges={edges}
              workflowId={workflowId}
            />
            <button 
              onClick={onLayout}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-white rounded-lg text-sm hover:bg-zinc-800 transition-colors"
            >
              Auto Layout
            </button>
          </Panel>
          
          {menu && (
            <ContextMenu
              onClick={() => setMenu(null)}
              {...menu}
              onDuplicate={() => duplicateNode(menu.id)}
              onDelete={() => deleteNode(menu.id)}
              onAutoLayout={onLayout}
            />
          )}
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

export default function WorkflowCanvas({ workflowId }: { workflowId: string }) {
  return (
    <ReactFlowProvider>
      <Flow workflowId={workflowId} />
    </ReactFlowProvider>
  );
}
