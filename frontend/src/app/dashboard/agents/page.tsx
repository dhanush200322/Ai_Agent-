'use client';

import React, { useState, useMemo } from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { AgentList } from '@/features/agents/components/AgentList';
import { AgentMetrics } from '@/features/agents/components/AgentMetrics';
import { useAgents } from '@/features/agents/hooks/useAgents';
import { Search, Plus, LayoutGrid, List, Filter } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import Link from 'next/link';

export default function AgentsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Local filters since backend doesn't support them
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, error } = useAgents(page, limit, debouncedSearch);

  // Apply local filters
  const filteredAgents = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter(agent => {
      if (statusFilter !== 'ALL' && agent.status !== statusFilter) return false;
      if (visibilityFilter !== 'ALL' && agent.visibility !== visibilityFilter) return false;
      return true;
    });
  }, [data?.items, statusFilter, visibilityFilter]);

  return (
    <ContentWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <PageHeader 
          title="AI Agents"
          description="Manage your enterprise autonomous agents, their configurations, and deployments."
        />
        <Link href="/dashboard/agents/create">
          <MagneticButton variant="primary" className="px-5 py-2.5 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </MagneticButton>
        </Link>
      </div>

      <AgentMetrics agents={filteredAgents} totalFromApi={data?.total} />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] p-2 rounded-xl">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" />
          <input
            type="text"
            placeholder="Search agents by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] focus:border-[#D4AF37]/50 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 border-r border-[rgba(255,255,255,0.1)] pr-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0A0A0A]">All Statuses</option>
              <option value="ACTIVE" className="bg-[#0A0A0A]">Active</option>
              <option value="INACTIVE" className="bg-[#0A0A0A]">Inactive</option>
              <option value="ARCHIVED" className="bg-[#0A0A0A]">Archived</option>
            </select>
            
            <select 
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer ml-2"
            >
              <option value="ALL" className="bg-[#0A0A0A]">All Visibility</option>
              <option value="PUBLIC" className="bg-[#0A0A0A]">Public</option>
              <option value="ORGANIZATION" className="bg-[#0A0A0A]">Organization</option>
              <option value="PRIVATE" className="bg-[#0A0A0A]">Private</option>
            </select>
          </div>

          <div className="flex items-center bg-[rgba(255,255,255,0.03)] rounded-lg p-1 border border-[rgba(255,255,255,0.05)]">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
          Failed to load agents. Please try again later.
        </div>
      ) : (
        <AgentList agents={filteredAgents} isLoading={isLoading} viewMode={viewMode} />
      )}

      {/* Pagination Controls */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)]">
          <p className="text-sm text-gray-500">
            Showing {filteredAgents.length} of {data.total} agents
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="px-4 py-2 text-sm bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </ContentWrapper>
  );
}
