import React, { useMemo, useState } from 'react';
import { ReactFlow, Background, BackgroundVariant, Controls, Panel, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SUPPORTED_NODES } from '../config/nodeRegistry';
import CustomNode from './nodes/CustomNode';
import { Play, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

export default function WorkflowReplay({ execution, version }: { execution: any, version: any }) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const nodeTypes = useMemo(() => {
    const types: Record<string, any> = {};
    SUPPORTED_NODES.forEach(def => {
      types[def.type] = CustomNode;
    });
    return types;
  }, []);

  const stepsByNodeId = useMemo(() => {
    const map: Record<string, any> = {};
    if (execution?.steps) {
      execution.steps.forEach((s: any) => {
        map[s.nodeId] = s;
      });
    }
    return map;
  }, [execution]);

  const nodes: Node[] = useMemo(() => {
    if (!version?.nodes) return [];
    return version.nodes.map((n: Node) => {
      const step = stepsByNodeId[n.id];
      let borderColor = 'border-zinc-800';
      if (step) {
        if (step.status === 'COMPLETED') borderColor = 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
        else if (step.status === 'FAILED') borderColor = 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
        else if (step.status === 'RUNNING') borderColor = 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse';
        else if (step.status === 'SKIPPED') borderColor = 'border-zinc-600 opacity-50';
      }
      
      return {
        ...n,
        draggable: false,
        className: `${n.className || ''} ${borderColor} transition-all duration-300`,
      };
    });
  }, [version, stepsByNodeId]);

  const edges: Edge[] = useMemo(() => {
    if (!version?.connections) return [];
    return version.connections.map((e: Edge) => ({
      ...e,
      animated: stepsByNodeId[e.source]?.status === 'COMPLETED' || stepsByNodeId[e.source]?.status === 'RUNNING',
      style: { stroke: stepsByNodeId[e.source]?.status === 'COMPLETED' ? '#22c55e' : '#52525b' }
    }));
  }, [version, stepsByNodeId]);

  const selectedStep = selectedStepId ? stepsByNodeId[selectedStepId] : null;

  return (
    <div className="flex w-full h-full bg-zinc-950 relative overflow-hidden">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(e, node) => setSelectedStepId(node.id)}
          onPaneClick={() => setSelectedStepId(null)}
          fitView
          className="bg-zinc-950"
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#3f3f46" />
          <Controls className="bg-zinc-900 border-zinc-800 fill-white" />
          <Panel position="top-left" className="bg-zinc-900 border border-zinc-800 p-2 flex items-center gap-2 rounded-lg m-4">
            <span className="flex items-center gap-1 text-xs text-green-400 font-medium px-2"><CheckCircle className="w-3 h-3" /> Completed</span>
            <span className="flex items-center gap-1 text-xs text-red-400 font-medium px-2 border-l border-zinc-800"><XCircle className="w-3 h-3" /> Failed</span>
            <span className="flex items-center gap-1 text-xs text-blue-400 font-medium px-2 border-l border-zinc-800"><Play className="w-3 h-3" /> Running</span>
          </Panel>
        </ReactFlow>
      </div>

      {/* Debugger Panel */}
      {selectedStep && (
        <div className="w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full shadow-2xl z-20 animate-in slide-in-from-right">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Node Debugger</h3>
              <p className="text-xs text-zinc-400 font-mono mt-1">{selectedStep.nodeId} ({selectedStep.nodeType})</p>
            </div>
            <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
              selectedStep.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
              selectedStep.status === 'FAILED' ? 'bg-red-500/10 text-red-500' :
              selectedStep.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-500' :
              'bg-zinc-800 text-zinc-400'
            }`}>
              {selectedStep.status}
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-zinc-500" /> Duration</span>
              <span className="font-mono text-white">{selectedStep.duration || 0}ms</span>
            </div>

            {selectedStep.error && (
              <div>
                <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Error</h4>
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl font-mono whitespace-pre-wrap">
                  {selectedStep.error}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Input</h4>
              <pre className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs p-3 rounded-xl font-mono overflow-x-auto">
                {selectedStep.input ? JSON.stringify(JSON.parse(selectedStep.input), null, 2) : '{}'}
              </pre>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Output</h4>
              <pre className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs p-3 rounded-xl font-mono overflow-x-auto">
                {selectedStep.output ? JSON.stringify(JSON.parse(selectedStep.output), null, 2) : '{}'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
