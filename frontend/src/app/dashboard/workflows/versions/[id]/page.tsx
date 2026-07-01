'use client';

import React, { useState } from 'react';
import { ArrowLeft, History, RotateCcw, AlertTriangle } from 'lucide-react';
import { useWorkflow, useUpdateWorkflow } from '@/features/workflows/hooks/useWorkflows';
import Link from 'next/link';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { ReactFlow, Background, BackgroundVariant, Controls, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SUPPORTED_NODES } from '@/features/workflows/config/nodeRegistry';
import CustomNode from '@/features/workflows/components/nodes/CustomNode';
import { useRouter, useParams } from 'next/navigation';

export default function WorkflowVersionsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: workflow, isLoading } = useWorkflow(id);
  const updateMutation = useUpdateWorkflow(id);
  const router = useRouter();
  
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const versions = workflow?.versions || [];
  const selectedVersion = versions.find((v: any) => v.id === selectedVersionId) || versions[0];

  const handleRestore = async () => {
    if (!selectedVersion) return;
    const confirm = window.confirm('Are you sure you want to restore this version? It will overwrite your current draft.');
    if (!confirm) return;

    await updateMutation.mutateAsync({
      nodes: selectedVersion.nodes,
      connections: selectedVersion.connections,
    });
    
    alert('Version restored to draft successfully.');
    router.push(`/dashboard/workflows/${params.id}`);
  };

  const nodeTypes = React.useMemo(() => {
    const types: Record<string, any> = {};
    SUPPORTED_NODES.forEach(def => {
      types[def.type] = CustomNode;
    });
    return types;
  }, []);

  return (
    <ContentWrapper>
      <PageHeader 
        title={`${workflow?.name || 'Workflow'} Versions`}
        description="View and restore previous versions of your workflow."
        actions={
          <Link 
            href={`/dashboard/workflows/${params.id}`}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Builder
          </Link>
        }
      />

      <div className="flex h-[calc(100vh-140px)] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl mt-4">
        
        {/* Versions Sidebar */}
        <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900">
            <h3 className="font-semibold text-white">Version History</h3>
            <p className="text-xs text-zinc-500 mt-1">{versions.length} versions published</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-zinc-500 text-sm">Loading versions...</div>
            ) : versions.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No versions found. Publish to create one.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {versions.map((v: any, index: number) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVersionId(v.id)}
                    className={`w-full text-left p-4 hover:bg-zinc-800/50 transition-colors flex flex-col gap-2 ${selectedVersion?.id === v.id ? 'bg-zinc-800 border-l-2 border-yellow-500' : 'border-l-2 border-transparent'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 font-bold text-white">
                        <History className="w-4 h-4 text-purple-500" />
                        Version {versions.length - index}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                        {v.versionNumber}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {new Date(v.createdAt).toLocaleString()}
                    </div>
                    {index === 0 && (
                      <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded inline-block w-max mt-1 border border-green-500/20">
                        Current Published
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visual Viewer Main Area */}
        <div className="flex-1 bg-zinc-950 relative">
          {selectedVersion ? (
            <ReactFlow
              nodes={selectedVersion.nodes.map((n: any) => ({ ...n, draggable: false }))}
              edges={selectedVersion.connections}
              nodeTypes={nodeTypes}
              fitView
              className="bg-zinc-950"
            >
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#3f3f46" />
              <Controls className="bg-zinc-900 border-zinc-800 fill-white" />
              <Panel position="top-right" className="m-4 flex flex-col items-end gap-2">
                <button 
                  onClick={handleRestore}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-xl"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore to Draft
                </button>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Restoring will overwrite your current unpublished draft
                </div>
              </Panel>
            </ReactFlow>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
              Select a version to view.
            </div>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
}
