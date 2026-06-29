import React from 'react';
import { Agent } from '../types/agent';
import { Bot, PlayCircle, Archive, Globe, Lock, Shield } from 'lucide-react';

interface AgentMetricsProps {
  agents: Agent[];
  totalFromApi?: number;
}

export function AgentMetrics({ agents, totalFromApi }: AgentMetricsProps) {
  // If the backend has pagination, we might only have 10 agents here, but totalFromApi might be 100.
  // The metrics will only accurately reflect the CURRENT PAGE unless the backend exposes a metrics endpoint.
  // We'll calculate based on the current list as a placeholder for enterprise metrics.
  
  const metrics = [
    {
      label: 'Total Agents',
      value: totalFromApi || agents.length,
      icon: <Bot className="w-5 h-5 text-blue-400" />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      label: 'Active',
      value: agents.filter(a => a.status === 'ACTIVE').length,
      icon: <PlayCircle className="w-5 h-5 text-green-400" />,
      bg: 'bg-green-500/10',
      border: 'border-green-500/20'
    },
    {
      label: 'Archived',
      value: agents.filter(a => a.status === 'ARCHIVED').length,
      icon: <Archive className="w-5 h-5 text-gray-400" />,
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/20'
    },
    {
      label: 'Public',
      value: agents.filter(a => a.visibility === 'PUBLIC').length,
      icon: <Globe className="w-5 h-5 text-purple-400" />,
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      label: 'Organization',
      value: agents.filter(a => a.visibility === 'ORGANIZATION').length,
      icon: <Building2Icon />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      label: 'Private',
      value: agents.filter(a => a.visibility === 'PRIVATE').length,
      icon: <Lock className="w-5 h-5 text-rose-400" />,
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metrics.map((m, i) => (
        <div key={i} className={`flex items-center p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:${m.border} transition-colors`}>
          <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center mr-3`}>
            {m.icon}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">{m.label}</p>
            <h4 className="text-lg font-bold text-white">{m.value}</h4>
          </div>
        </div>
      ))}
    </div>
  );
}

function Building2Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
  );
}
