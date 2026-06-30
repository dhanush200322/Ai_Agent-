'use client';

import React from 'react';
import { use } from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import WorkflowCanvas from '@/features/workflows/components/WorkflowCanvas';
import { ReactFlowProvider } from '@xyflow/react';

export default function WorkflowBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 bg-zinc-900 px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-white font-semibold flex items-center gap-2">
            Workflow Builder
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs font-medium text-zinc-400 font-mono">
              {resolvedParams.id}
            </span>
          </h1>
        </div>
      </div>
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <WorkflowCanvas workflowId={resolvedParams.id} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
