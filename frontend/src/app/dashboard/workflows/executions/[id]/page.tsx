'use client';

import React, { use } from 'react';
import { useWorkflowHistory, useExecuteWorkflow, useWorkflow } from '@/features/workflows/hooks/useWorkflows';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { Clock, Play, CheckCircle, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ExecutionHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: workflow } = useWorkflow(resolvedParams.id);
  const { data: executions = [], isLoading } = useWorkflowHistory(resolvedParams.id);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'RUNNING': return <Play className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'PAUSED': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <ContentWrapper>
      <PageHeader 
        title={`Execution History: ${workflow?.name || resolvedParams.id}`}
        description="Monitor past and running executions for this workflow."
        actions={
          <Link 
            href={`/dashboard/workflows/builder/${resolvedParams.id}`}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl hover:bg-zinc-800 transition-colors font-medium"
          >
            Back to Builder
          </Link>
        }
      />

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mt-8">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
          <h2 className="font-medium text-white">Execution Logs</h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-zinc-500">Loading history...</div>
        ) : executions.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">No executions found for this workflow.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {executions.map((exec: any) => (
              <details key={exec.id} className="group">
                <summary className="p-4 flex items-center justify-between hover:bg-zinc-800/50 cursor-pointer list-none transition-colors">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(exec.status)}
                    <div>
                      <div className="font-mono text-xs text-zinc-300 font-medium">Execution: {exec.id}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {new Date(exec.startedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-zinc-400 font-mono">
                      {exec.finishedAt ? `${Math.round((new Date(exec.finishedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000)}s` : '...'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-open:rotate-90 transition-transform" />
                  </div>
                </summary>
                <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-4">
                  
                  {/* Detailed Timeline */}
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Timeline</h4>
                    <div className="space-y-3 pl-2">
                      {exec.steps?.map((step: any, i: number) => (
                        <div key={i} className="flex gap-4 relative">
                          <div className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full z-10 ${
                              step.status === 'COMPLETED' ? 'bg-green-500' :
                              step.status === 'FAILED' ? 'bg-red-500' :
                              step.status === 'PAUSED' ? 'bg-orange-500' :
                              'bg-blue-500 animate-pulse'
                            }`} />
                            {i < exec.steps.length - 1 && (
                              <div className="w-px h-full bg-zinc-800 absolute top-2.5" />
                            )}
                          </div>
                          <div className="pb-4">
                            <div className="text-sm font-medium text-white flex items-center gap-2">
                              {step.nodeId}
                              <span className="text-[10px] text-zinc-500 font-mono">{new Date(step.startedAt).toLocaleTimeString()}</span>
                            </div>
                            {step.error && (
                              <div className="text-xs text-red-400 mt-1 bg-red-500/10 p-2 rounded border border-red-500/20">
                                {step.error}
                              </div>
                            )}
                            {step.status === 'PAUSED' && (
                              <div className="mt-2 flex gap-2">
                                <button className="px-3 py-1 bg-green-500/20 text-green-500 text-xs font-medium rounded hover:bg-green-500/30 transition-colors">
                                  Approve
                                </button>
                                <button className="px-3 py-1 bg-red-500/20 text-red-500 text-xs font-medium rounded hover:bg-red-500/30 transition-colors">
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}
