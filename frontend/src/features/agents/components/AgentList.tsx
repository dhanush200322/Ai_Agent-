import React from 'react';
import { Agent } from '../types/agent';
import { AgentCard } from './AgentCard';
import { Bot, Plus } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import Link from 'next/link';

interface AgentListProps {
  agents: Agent[];
  isLoading: boolean;
  viewMode: 'grid' | 'list';
}

export function AgentList({ agents, isLoading, viewMode }: AgentListProps) {
  if (isLoading) {
    return (
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl bg-[rgba(255,255,255,0.01)]">
        <div className="w-20 h-20 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center mb-6">
          <Bot className="w-10 h-10 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Agents Found</h3>
        <p className="text-gray-400 max-w-md mb-8">
          You haven't created any AI agents yet, or none match your current filters. Create your first autonomous enterprise agent to get started.
        </p>
        <Link href="/dashboard/agents/create">
          <MagneticButton variant="primary" className="px-6 py-2.5">
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </MagneticButton>
        </Link>
      </div>
    );
  }

  return (
    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
