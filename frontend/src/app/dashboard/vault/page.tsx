'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { useSecrets, useVaultStats, useRetrieveSecret, VaultSecret } from '@/services/vault/vault.service';
import { Lock, Search, Plus, Shield, Key, Eye, EyeOff, Copy, CheckCircle2, Clock, Hash, Database, Cloud, Mail, CreditCard, Box, Fingerprint, Calendar, MoreVertical } from 'lucide-react';

export default function VaultPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'secrets' ? 'secrets' : 'dashboard';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'secrets'>(defaultTab);
  const { data: secrets, isLoading: isLoadingSecrets } = useSecrets();
  const { data: stats, isLoading: isLoadingStats } = useVaultStats();
  const router = useRouter();

  return (
    <ContentWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="Enterprise Vault"
          description="Securely manage secrets, API keys, and credentials."
        />
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('secrets')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'secrets' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Secrets List
            </button>
          </div>
          <button 
            onClick={() => router.push('/dashboard/vault/create')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> New Secret
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <VaultDashboard stats={stats} isLoading={isLoadingStats} />
          </motion.div>
        ) : (
          <motion.div key="secrets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SecretsList secrets={secrets} isLoading={isLoadingSecrets} />
          </motion.div>
        )}
      </AnimatePresence>
    </ContentWrapper>
  );
}

function VaultDashboard({ stats, isLoading }: { stats?: any, isLoading: boolean }) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl border border-white/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Shield className="w-5 h-5 text-emerald-400" />} label="Active Secrets" value={stats.activeSecrets || 0} />
        <StatCard icon={<Box className="w-5 h-5 text-indigo-400" />} label="Categories" value={stats.categories || 0} />
        <StatCard icon={<Cloud className="w-5 h-5 text-blue-400" />} label="Providers" value={stats.providers || 0} />
        <StatCard icon={<Clock className="w-5 h-5 text-amber-400" />} label="Recently Rotated (7d)" value={stats.rotated || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/10 rounded-lg"><Lock className="w-5 h-5 text-rose-400" /></div>
              <h3 className="text-lg font-medium text-white">Disabled / Revoked</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">Secrets that are no longer active or have been manually revoked by administrators.</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-white">{stats.disabledSecrets + stats.expired || 0}</span>
            <span className="text-sm text-slate-500">Total inactive</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg"><Clock className="w-5 h-5 text-amber-400" /></div>
              <h3 className="text-lg font-medium text-white">Expiring Soon</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">Active leases and secrets that are scheduled to expire in the near future.</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-white">{stats.expiringSoon || 0}</span>
            <span className="text-sm text-slate-500">Needs attention</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg"><Key className="w-5 h-5 text-indigo-400" /></div>
              <h3 className="text-lg font-medium text-white">Usage Summary</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">Total number of times secrets were accessed, read, or rotated across the workspace.</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-white">{stats.accessCount || 0}</span>
            <span className="text-sm text-slate-500">Access logs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col justify-between backdrop-blur-md hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

import { CategoryBadge } from '@/components/dashboard/vault/CategoryBadge';

function SecretsList({ secrets, isLoading }: { secrets?: VaultSecret[], isLoading: boolean }) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = secrets?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.provider.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by name, provider, or category..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-slate-400 text-sm">
                <th className="p-4 font-medium sticky left-0 z-10 bg-black/40 backdrop-blur-xl min-w-[200px]">Secret Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Provider</th>
                <th className="p-4 font-medium hidden md:table-cell">Secret Value</th>
                <th className="p-4 font-medium hidden md:table-cell">Created Date</th>
                <th className="p-4 font-medium hidden md:table-cell">Updated Date</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-4 sticky left-0 z-10 bg-[#0A0A0A]/90 backdrop-blur-xl"><div className="w-32 h-4 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="w-20 h-5 bg-white/5 rounded-full animate-pulse" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4 hidden md:table-cell"><div className="w-24 h-4 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4 hidden md:table-cell"><div className="w-24 h-4 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4"></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState 
                      icon={Key}
                      title="No Secrets Found"
                      description="No secrets match your search. Create a new secret to store credentials."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((secret, index) => (
                  <SecretRow key={secret.id} secret={secret} index={index} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SecretRow({ secret, index }: { secret: VaultSecret, index: number }) {
  const router = useRouter();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: secretData, refetch, isFetching } = useRetrieveSecret(secret.id);

  const handleToggleShow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showKey) {
      await refetch();
    }
    setShowKey(!showKey);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let value = secretData?.value;
    if (!value) {
      const res = await refetch();
      value = res.data?.value;
    }
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.tr 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer group"
      onClick={() => router.push(`/dashboard/vault/${secret.id}`)}
    >
      <td className="p-4 sticky left-0 z-10 bg-[#0A0A0A]/90 backdrop-blur-xl group-hover:bg-[#151515]/90 transition-colors">
        <div className="font-medium text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" /> <span className="truncate">{secret.name}</span>
        </div>
        {secret.description && <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{secret.description}</div>}
      </td>
      <td className="p-4 whitespace-nowrap">
        <CategoryBadge category={secret.category} />
      </td>
      <td className="p-4 text-slate-300 text-sm whitespace-nowrap">
        {secret.provider}
      </td>
      <td className="p-4 hidden md:table-cell whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="font-mono text-xs bg-black/40 px-2 py-1 rounded text-slate-300 border border-white/10 w-32 truncate">
            {isFetching ? 'Loading...' : showKey && secretData?.value ? secretData.value : '••••••••••••••••'}
          </div>
          <button onClick={handleToggleShow} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors" title={showKey ? "Hide Secret" : "Show Secret"}>
            {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors" title="Copy to clipboard">
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
      <td className="p-4 text-sm text-slate-400 hidden md:table-cell whitespace-nowrap">
        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(secret.createdAt).toLocaleDateString()}</div>
      </td>
      <td className="p-4 text-right">
        <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors" onClick={e => e.stopPropagation()}>
          <MoreVertical className="w-4 h-4" />
        </button>
      </td>
    </motion.tr>
  );
}
