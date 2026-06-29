import React from 'react';
import { Agent } from '../types/agent';
import { MoreVertical, Bot, Globe, Lock, Building2, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { MagneticButton } from '@/components/ui/MagneticButton';

interface AgentCardProps {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onDuplicate?: (agent: Agent) => void;
}

export function AgentCard({ agent, onEdit, onDelete, onDuplicate }: AgentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-500 border-green-500/20';
      case 'INACTIVE': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
      case 'ARCHIVED': return 'bg-gray-500/20 text-gray-500 border-gray-500/20';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/20';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC': return <Globe className="w-3.5 h-3.5 mr-1" />;
      case 'ORGANIZATION': return <Building2 className="w-3.5 h-3.5 mr-1" />;
      case 'PRIVATE': return <Lock className="w-3.5 h-3.5 mr-1" />;
      default: return <Lock className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <div className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[#D4AF37]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.05)] overflow-hidden">
      {/* Top Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden shrink-0">
            {agent.avatar ? (
              <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              <Bot className="w-6 h-6 text-[#D4AF37]" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-[#D4AF37] transition-colors truncate max-w-[180px]">
              {agent.name}
            </h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
              <span className="flex items-center text-[10px] text-gray-400">
                {getVisibilityIcon(agent.visibility)}
                <span className="capitalize">{agent.visibility.toLowerCase()}</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors opacity-0 group-hover:opacity-100">
            <MoreVertical className="w-5 h-5" />
          </button>
          {/* Dropdown menu will be integrated later with a proper Radix or Headless UI component */}
        </div>
      </div>

      {/* Middle Section */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
          {agent.description || 'No description provided for this agent.'}
        </p>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.05)]">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center text-[11px] text-gray-500">
            <Bot className="w-3 h-3 mr-1.5 text-gray-400" />
            <span className="font-medium text-gray-300">{agent.model}</span>
          </div>
          <div className="flex items-center text-[11px] text-gray-500">
            <Calendar className="w-3 h-3 mr-1.5" />
            <span>Updated {new Date(agent.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <Link href={`/dashboard/agents/${agent.id}`}>
          <MagneticButton variant="primary" className="px-4 py-1.5 text-xs">
            Manage
          </MagneticButton>
        </Link>
      </div>
    </div>
  );
}
