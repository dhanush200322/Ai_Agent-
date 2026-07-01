'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useWorkflow, useWorkflowHistory } from '@/features/workflows/hooks/useWorkflows';
import Link from 'next/link';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import WorkflowReplay from '@/features/workflows/components/WorkflowReplay';
import { useParams } from 'next/navigation';

export default function WorkflowExecutionsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: workflow, isLoading: workflowLoading } = useWorkflow(id);
  const { data: history = [], isLoading: historyLoading } = useWorkflowHistory(id);
  
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);

  const selectedExecution = history.find((h: any) => h.id === selectedExecutionId);
  
  // Find the exact version that was executed, or fallback to latest
  const version = workflow?.versions?.find((v: any) => v.id === selectedExecution?.workflowVersionId) 
    || workflow?.versions?.[0];

  return (
    <ContentWrapper>
      <PageHeader 
        title={`${workflow?.name || 'Workflow'} Executions`}
        description="View execution history, debug node inputs and outputs, and monitor performance."
        actions={
          <Link 
            href="/dashboard/workflows"
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workflows
          </Link>
        }
      />

      <div className="flex h-[calc(100vh-140px)] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl mt-4">
        
        {/* History List Sidebar */}
        <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900">
            <h3 className="font-semibold text-white">Execution History</h3>
            <p className="text-xs text-zinc-500 mt-1">{history.length} total runs</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {historyLoading ? (
              <div className="p-8 text-center text-zinc-500 text-sm">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No executions found.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {history.map((exec: any) => (
                  <button
                    key={exec.id}
                    onClick={() => setSelectedExecutionId(exec.id)}
                    className={`w-full text-left p-4 hover:bg-zinc-800/50 transition-colors flex flex-col gap-2 ${selectedExecutionId === exec.id ? 'bg-zinc-800 border-l-2 border-yellow-500' : 'border-l-2 border-transparent'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        exec.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                        exec.status === 'FAILED' ? 'bg-red-500/10 text-red-500' :
                        exec.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {exec.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                        {exec.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                        {exec.status === 'RUNNING' && <Clock className="w-3 h-3" />}
                        {exec.status}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {new Date(exec.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {new Date(exec.startedAt).toLocaleDateString()}
                    </div>
                    {exec.error && (
                      <div className="text-xs text-red-400 flex items-start gap-1 mt-1 bg-red-500/5 p-2 rounded border border-red-500/10">
                        <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{exec.error}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visual Debugger Main Area */}
        <div className="flex-1 bg-zinc-950 relative">
          {workflowLoading || historyLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500">Loading Canvas...</div>
          ) : !selectedExecutionId ? (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
              Select an execution from the list to view its visual replay and debug logs.
            </div>
          ) : version && selectedExecution ? (
            <WorkflowReplay execution={selectedExecution} version={version} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
              Unable to load execution replay. Missing version data.
            </div>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
}
