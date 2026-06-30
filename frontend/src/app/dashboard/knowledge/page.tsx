'use client';

import React, { useState } from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Search, Database, Plus, Loader2, HardDrive, Cpu, CheckCircle2, XCircle } from 'lucide-react';
import { useKnowledgeBases } from '@/features/knowledge/hooks/useKnowledge';
import { KnowledgeBaseCard } from '@/features/knowledge/components/KnowledgeBaseCard';
import { CreateKnowledgeDialog } from '@/features/knowledge/components/CreateKnowledgeDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRouter } from 'next/navigation';
import { useAllKnowledgeStats } from '@/features/knowledge/hooks/useKnowledgeStats';

export default function KnowledgeDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data, isLoading, error } = useKnowledgeBases(1, 100, search);
  const kbIds = data?.items.map(kb => kb.id);
  const { data: stats } = useAllKnowledgeStats(kbIds);

  const knowledgeBasesCount = data?.total || 0;
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <ContentWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="Knowledge" 
          description="Manage enterprise knowledge bases and documentation."
        />
        <MagneticButton onClick={() => setIsCreateOpen(true)} variant="primary" className="px-5 py-2.5">
          <Plus className="w-5 h-5 mr-2" />
          Create Knowledge Base
        </MagneticButton>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-xs text-gray-500 font-medium mb-1">Knowledge Bases</p>
          <h3 className="text-2xl font-bold text-white">{isLoading ? '-' : knowledgeBasesCount}</h3>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-xs text-gray-500 font-medium mb-1">Documents</p>
          <h3 className="text-2xl font-bold text-white">{stats ? stats.totalDocuments : '-'}</h3>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-xs text-[#D4AF37] font-medium mb-1">Processing Queue</p>
          <h3 className="text-2xl font-bold text-white">{stats ? stats.processing : '-'}</h3>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-xs text-green-500 font-medium mb-1">Completed</p>
          <h3 className="text-2xl font-bold text-white">{stats ? stats.completed : '-'}</h3>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-xs text-red-500 font-medium mb-1">Failed</p>
          <h3 className="text-2xl font-bold text-white">{stats ? stats.failed : '-'}</h3>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-xs text-gray-400 font-medium mb-1">Pending</p>
          <h3 className="text-2xl font-bold text-white">{stats ? stats.pending : '-'}</h3>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-xs text-blue-400 font-medium mb-1">Storage</p>
          <h3 className="text-2xl font-bold text-white">{stats ? formatBytes(stats.storageBytes) : '-'}</h3>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 min-h-[500px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-white">Your Knowledge Bases</h2>
          
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search knowledge bases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-[rgba(255,255,255,0.1)] rounded-lg bg-[rgba(255,255,255,0.02)] text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors sm:text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center">
            Failed to load knowledge bases.
          </div>
        ) : data?.items.length === 0 ? (
          <EmptyState 
            icon={Database}
            title={search ? "No matches found" : "No Knowledge Bases Yet"}
            description={search ? "Try adjusting your search terms." : "Create your first Knowledge Base to organize and vectorize your enterprise documents."}
            actionLabel={search ? undefined : "Create Knowledge Base"}
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.items.map(kb => (
              <KnowledgeBaseCard key={kb.id} kb={kb} />
            ))}
          </div>
        )}
      </div>

      <CreateKnowledgeDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={(id) => router.push(`/dashboard/knowledge/${id}`)}
      />
    </ContentWrapper>
  );
}
