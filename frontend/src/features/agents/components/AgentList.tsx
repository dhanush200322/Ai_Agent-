import React from 'react';
import { Agent } from '../types/agent';
import { AgentCard } from './AgentCard';
import { Bot, Plus } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import Link from 'next/link';
import { AgentAvatar } from '@/components/common/AgentAvatar';

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

  if (viewMode === 'list') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-slate-400 text-sm">
                <th className="p-4 font-medium sticky left-0 z-10 bg-black/40 backdrop-blur-xl min-w-[200px]">Agent Name</th>
                <th className="p-4 font-medium hidden md:table-cell">Description</th>
                <th className="p-4 font-medium">Model</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium hidden md:table-cell">Updated</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer group">
                  <td className="p-4 sticky left-0 z-10 bg-[#0A0A0A]/90 backdrop-blur-xl group-hover:bg-[#151515]/90 transition-colors">
                    <div className="flex items-center space-x-3">
                      <AgentAvatar
                        imageUrl={agent.avatar}
                        name={agent.name}
                        size="md"
                        className="w-10 h-10 rounded-xl"
                      />
                      <div>
                        <h4 className="text-white font-medium truncate max-w-[150px]">{agent.name}</h4>
                        <span className="text-[10px] text-gray-500 capitalize">{agent.visibility.toLowerCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <p className="text-sm text-gray-400 truncate max-w-[200px] lg:max-w-[300px]">
                      {agent.description || 'No description'}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-300 bg-white/5 px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                      {agent.model}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border whitespace-nowrap ${
                      agent.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      agent.status === 'INACTIVE' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-gray-500/10 text-gray-500 border-gray-500/20'
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400 hidden md:table-cell whitespace-nowrap">
                    {new Date(agent.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/dashboard/agents/${agent.id}`}>
                      <MagneticButton variant="primary" className="px-3 py-1.5 text-xs whitespace-nowrap">
                        Manage
                      </MagneticButton>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
