'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, FileText, CheckCircle, Clock, Zap, Plus, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useWorkflows, useWorkflowExecutions, useCreateWorkflow } from '@/features/workflows/hooks/useWorkflows';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { FEATURE_FLAGS } from '@/config/features';
import { ComingSoon } from '@/components/dashboard/ComingSoon';

type SortField = 'name' | 'status' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function WorkflowsDashboard() {
  const { data: workflows = [], isLoading: workflowsLoading } = useWorkflows();
  const { data: executions = [], isLoading: executionsLoading } = useWorkflowExecutions();
  const createMutation = useCreateWorkflow();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const pageSize = 10;

  const handleCreate = async () => {
    if (!newWorkflowName.trim()) return;
    try {
      const slug = newWorkflowName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      const result = await createMutation.mutateAsync({
        name: newWorkflowName,
        slug,
        description: newWorkflowDesc
      });
      router.push(`/dashboard/workflows/builder/${result.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const activeWorkflows = workflows.filter((w: any) => w.status === 'ACTIVE').length;
  const draftWorkflows = workflows.filter((w: any) => w.status === 'DRAFT').length;
  const runningExecutions = executions.filter((e: any) => e.status === 'RUNNING').length;
  const completedExecutions = executions.filter((e: any) => e.status === 'COMPLETED').length;
  
  const successRate = executions.length > 0 
    ? Math.round((completedExecutions / executions.length) * 100) 
    : 100;

  const processedWorkflows = useMemo(() => {
    // 1. Filter
    let filtered = workflows.filter((w: any) => 
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (w.description && w.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // 2. Sort
    filtered.sort((a: any, b: any) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'updatedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [workflows, searchTerm, sortField, sortOrder]);

  // 3. Paginate
  const totalPages = Math.ceil(processedWorkflows.length / pageSize);
  const paginatedWorkflows = processedWorkflows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (!FEATURE_FLAGS.workflowBuilder) {
    return (
      <ContentWrapper>
        <ComingSoon title="Workflow Builder" />
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <PageHeader 
        title="Workflows"
        description="Design, deploy, and monitor enterprise automation."
        actions={
          <div className="flex gap-3">
            <Link 
              href="/dashboard/workflows/templates"
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2 font-medium"
            >
              <FileText className="w-4 h-4" />
              Templates
            </Link>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Workflow
            </button>
          </div>
        }
      />

      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Workflows" value={workflows.length} subtitle={`${activeWorkflows} Active, ${draftWorkflows} Draft`} icon={<Zap className="w-5 h-5 text-yellow-500" />} />
          <StatCard title="Running Executions" value={runningExecutions} subtitle="Currently active" icon={<Play className="w-5 h-5 text-blue-500" />} />
          <StatCard title="Completed Today" value={completedExecutions} subtitle="Last 24 hours" icon={<CheckCircle className="w-5 h-5 text-green-500" />} />
          <StatCard title="Success Rate" value={`${successRate}%`} subtitle="All time average" icon={<Clock className="w-5 h-5 text-purple-500" />} />
        </div>

        {/* Workflow List */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search workflows..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 w-64 outline-none transition-shadow"
              />
            </div>
            <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {workflowsLoading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Loading workflows...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-900 text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-2">Name <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                      </th>
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>
                        <div className="flex items-center gap-2">Status <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                      </th>
                      <th className="px-6 py-4 font-medium">Version</th>
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('updatedAt')}>
                        <div className="flex items-center gap-2">Last Modified <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                      </th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {paginatedWorkflows.map((w: any) => (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={w.id} 
                        className="hover:bg-zinc-800/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/workflows/builder/${w.id}`} className="block">
                            <span className="font-medium text-white block">{w.name}</span>
                            {w.description && <span className="text-xs text-zinc-500 mt-1 line-clamp-1">{w.description}</span>}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            w.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                            w.status === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                            'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-zinc-300">v{w.versions?.length || 0}</td>
                        <td className="px-6 py-4 text-xs">
                          {new Date(w.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link 
                              href={`/dashboard/workflows/builder/${w.id}`}
                              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Builder
                            </Link>
                            <Link 
                              href={`/dashboard/workflows/executions/${w.id}`}
                              className="px-3 py-1.5 border border-zinc-700 hover:border-zinc-600 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              History
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {paginatedWorkflows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-sm">
                          {searchTerm ? 'No workflows matched your search.' : 'No workflows found. Create one to get started.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-zinc-800 bg-zinc-950/30 flex items-center justify-between text-sm text-zinc-400">
                  <div>
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, processedWorkflows.length)} of {processedWorkflows.length} entries
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                          currentPage === i + 1 ? 'bg-zinc-800 text-white font-medium' : 'hover:bg-zinc-800/50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Create Workflow</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                  placeholder="e.g. Lead Qualification"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Description (Optional)</label>
                <textarea
                  value={newWorkflowDesc}
                  onChange={(e) => setNewWorkflowDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none resize-none"
                  placeholder="What does this workflow do?"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newWorkflowName.trim() || createMutation.isPending}
                className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ContentWrapper>
  );
}

function StatCard({ title, value, subtitle, icon }: { title: string, value: string | number, subtitle: string, icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-zinc-400 font-medium text-sm">{title}</h3>
        <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 group-hover:bg-zinc-900 transition-colors">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-zinc-500 font-medium">{subtitle}</div>
    </div>
  );
}
