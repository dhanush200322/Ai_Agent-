'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { 
  useSystemHealth, 
  useInfraHealth, 
  useDashboardMetrics, 
  observabilityKeys 
} from '@/services/observability/observability.service';
import { 
  Activity, Database, Server, HardDrive, Cpu, 
  Clock, CheckCircle2, AlertTriangle, XCircle, 
  RefreshCw, Layers, GitMerge, Bot, AreaChart
} from 'lucide-react';

export default function ObservabilityDashboard() {
  const queryClient = useQueryClient();
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  // Poll 30s countdown visually
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown(prev => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: observabilityKeys.all });
    setRefreshCountdown(30);
  };

  return (
    <ContentWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <PageHeader 
          title="Observability & Monitoring"
          description="Enterprise Operations Center and System Health."
        />
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Auto Refresh</span>
            <span className="text-sm font-mono text-indigo-400 font-semibold">{refreshCountdown}s</span>
          </div>
          <button 
            onClick={handleManualRefresh}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Now
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <GlobalStatusBanner />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <InfrastructureGrid />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WorkflowMonitor />
              <AgentMonitor />
            </div>
          </div>
          <div className="space-y-6">
            <AlertsPanel />
            <AIHealthMonitor />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KnowledgeMonitorPlaceholder />
          <HistoricalMetricsPlaceholder />
        </div>
      </div>
    </ContentWrapper>
  );
}

function StatusBadge({ status }: { status: string | undefined }) {
  if (!status) return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Unknown</span>;
  const s = status.toLowerCase();
  
  if (s === 'healthy' || s === 'ready' || s === 'connected' || s === 'active' || s === 'writable' || s === 'ok') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Operational</span>;
  }
  if (s === 'degraded' || s === 'warning') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Degraded</span>;
  }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Offline</span>;
}

function GlobalStatusBanner() {
  const { data, isLoading } = useSystemHealth();
  const isHealthy = data?.success && data.data?.status === 'OK';

  return (
    <div className={`rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border ${
      isLoading ? 'bg-white/5 border-white/10' : 
      isHealthy ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${isLoading ? 'bg-white/10' : isHealthy ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
          {isLoading ? <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" /> :
           isHealthy ? <Activity className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-rose-400" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Enterprise AI Platform</h2>
          <p className="text-sm text-slate-300">
            Overall Status: <strong className={isLoading ? 'text-slate-400' : isHealthy ? 'text-emerald-400' : 'text-rose-400'}>
              {isLoading ? 'CHECKING...' : isHealthy ? 'HEALTHY' : 'DEGRADED'}
            </strong>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="flex flex-col">
          <span className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Last Checked</span>
          <span className="text-white font-semibold">Just now</span>
        </div>
      </div>
    </div>
  );
}

function InfrastructureGrid() {
  const db = useInfraHealth('database');
  const redis = useInfraHealth('redis');
  const queue = useInfraHealth('queue');
  const storage = useInfraHealth('storage');
  const qdrant = useInfraHealth('ai');

  const rows = [
    { name: 'PostgreSQL', icon: <Database className="w-4 h-4 text-indigo-400" />, data: db.data, isLoading: db.isLoading },
    { name: 'Redis', icon: <Server className="w-4 h-4 text-rose-400" />, data: redis.data, isLoading: redis.isLoading },
    { name: 'Background Queue', icon: <Layers className="w-4 h-4 text-amber-400" />, data: queue.data, isLoading: queue.isLoading },
    { name: 'Local Storage', icon: <HardDrive className="w-4 h-4 text-emerald-400" />, data: storage.data, isLoading: storage.isLoading },
    { name: 'Qdrant (Vector DB)', icon: <Cpu className="w-4 h-4 text-purple-400" />, data: qdrant.data, isLoading: qdrant.isLoading },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
      <div className="p-5 border-b border-white/10 bg-black/20">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Server className="w-5 h-5 text-indigo-400" /> Infrastructure Status</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/40 text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Service</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Response Time</th>
              <th className="p-4 font-semibold">Last Checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, idx) => {
              const statusValue = row.data?.success ? row.data.data.status : 'offline';
              const latency = (row.data as any)?._latency;
              
              return (
                <tr key={row.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">{row.icon}</div>
                      <div>
                        <div className="font-medium text-white text-sm">{row.name}</div>
                        {row.data?.message && !row.data.success && (
                          <div className="text-xs text-rose-400 mt-1 max-w-[200px] truncate" title={row.data.message}>{row.data.message}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {row.isLoading ? <div className="h-6 w-24 bg-white/5 animate-pulse rounded-full" /> : <StatusBadge status={statusValue} />}
                  </td>
                  <td className="p-4 text-sm font-mono text-slate-300">
                    {row.isLoading ? <div className="h-4 w-12 bg-white/5 animate-pulse rounded" /> : (latency ? `${latency} ms` : 'N/A')}
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    Just now
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlertsPanel() {
  const db = useInfraHealth('database');
  const redis = useInfraHealth('redis');
  const queue = useInfraHealth('queue');
  const ai = useInfraHealth('ai');

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-400" /> System Alerts</h3>
      <div className="space-y-3">
        <AlertItem isLoading={db.isLoading} success={db.data?.success} name="PostgreSQL Connected" />
        <AlertItem isLoading={redis.isLoading} success={redis.data?.success} name="Redis Connected" />
        <AlertItem isLoading={queue.isLoading} success={queue.data?.success} name="Queue Running" />
        <AlertItem isLoading={ai.isLoading} success={ai.data?.success} name="AI Provider Connected" />
        
        <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white font-medium">Historical Metrics Unavailable</p>
            <p className="text-xs text-slate-400 mt-0.5">Time-series data is not currently exposed by the backend API.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ isLoading, success, name }: { isLoading: boolean, success?: boolean, name: string }) {
  if (isLoading) return <div className="h-12 bg-white/5 rounded-lg animate-pulse" />;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${success ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
      {success ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
      <div>
        <p className="text-sm text-white font-medium">{success ? name : `${name.replace('Connected', 'Disconnected').replace('Running', 'Stopped')}`}</p>
        <p className="text-xs text-slate-400 mt-0.5">{success ? 'Service is operating normally.' : 'Requires immediate attention.'}</p>
      </div>
    </div>
  );
}

function AIHealthMonitor() {
  const { data, isLoading } = useDashboardMetrics('AI');
  const aiHealth = useInfraHealth('ai');

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-purple-400" /> AI Provider & DB</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
          <span className="text-sm text-slate-400 font-medium">Connection Status</span>
          {aiHealth.isLoading ? <div className="w-20 h-6 bg-white/5 animate-pulse rounded-full" /> : <StatusBadge status={aiHealth.data?.success ? 'healthy' : 'offline'} />}
        </div>
        
        <div className="flex flex-col p-4 bg-black/20 rounded-lg border border-white/5 text-center py-6">
          <span className="text-sm text-slate-400 font-medium mb-2">Total Tokens Processed</span>
          {isLoading ? (
            <div className="w-24 h-10 bg-white/5 animate-pulse rounded-lg mx-auto" />
          ) : (
            <span className="text-4xl font-bold text-white font-mono">{data?.totalTokens?.toLocaleString() || '0'}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowMonitor() {
  const { data, isLoading } = useDashboardMetrics('WORKFLOW');

  // Backend returns { workflows: WorkflowHealth[] }
  const total = data?.workflows?.length || 0;
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><GitMerge className="w-5 h-5 text-emerald-400" /> Workflow Monitor</h3>
      <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-lg border border-white/5">
        {isLoading ? (
           <div className="w-16 h-16 bg-white/5 animate-pulse rounded-full mb-3" />
        ) : (
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mb-3 text-2xl font-bold font-mono">
            {total}
          </div>
        )}
        <h4 className="text-white font-medium">Tracked Workflows</h4>
        <p className="text-xs text-slate-400 text-center mt-2">
          Detailed metrics like Running/Failed status<br/>are limited by backend response payload.
        </p>
      </div>
    </div>
  );
}

function AgentMonitor() {
  const { data, isLoading } = useDashboardMetrics('RUNTIME');

  const total = data?.agents?.length || 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Bot className="w-5 h-5 text-indigo-400" /> Agent Monitor</h3>
      <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-lg border border-white/5">
        {isLoading ? (
           <div className="w-16 h-16 bg-white/5 animate-pulse rounded-full mb-3" />
        ) : (
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center justify-center mb-3 text-2xl font-bold font-mono">
            {total}
          </div>
        )}
        <h4 className="text-white font-medium">Active Agents</h4>
        <p className="text-xs text-slate-400 text-center mt-2">
          Requests and Average Response Time<br/>require backend analytics expansion.
        </p>
      </div>
    </div>
  );
}

function KnowledgeMonitorPlaceholder() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
        <Database className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">Knowledge Processing Analytics</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
        The current backend does not expose specific processing metrics. 
        <br/><br/>
        When available, this page will automatically display:
      </p>
      <ul className="text-left text-sm text-slate-300 space-y-2 mb-6">
        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> Processing Queue</li>
        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> Embedding Queue</li>
        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> Chunk Statistics</li>
        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> Failed Documents</li>
      </ul>
      <div className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-widest border border-indigo-500/20">
        Backend Support Required
      </div>
    </div>
  );
}

function HistoricalMetricsPlaceholder() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-50" />
      
      {/* Fake faint chart background */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-10 flex items-end justify-between px-10">
        {[40, 70, 45, 90, 65, 80, 50, 100].map((h, i) => (
          <div key={i} className="w-8 bg-white rounded-t-sm" style={{ height: `${h}%` }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <AreaChart className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">Historical Metrics</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
          Available when time-series metrics are exposed by the backend.
        </p>
        <p className="text-xs text-slate-500 mb-6">Only live snapshot health status is currently available.</p>
        <div className="px-4 py-2 bg-slate-500/10 text-slate-400 rounded-full text-xs font-semibold uppercase tracking-widest border border-slate-500/20">
          Backend Support Required
        </div>
      </div>
    </div>
  );
}
