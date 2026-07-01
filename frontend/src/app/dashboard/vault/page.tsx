'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { useSecrets, VaultSecret } from '@/services/vault/vault.service';
import { Lock, Search, Plus, Shield, Key, Eye, Clock, Hash, Database, Cloud, Mail, CreditCard, Box, Fingerprint, Calendar, MoreVertical } from 'lucide-react';

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'secrets'>('dashboard');
  const { data: secrets, isLoading } = useSecrets();
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
            <VaultDashboard secrets={secrets} isLoading={isLoading} />
          </motion.div>
        ) : (
          <motion.div key="secrets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SecretsList secrets={secrets} isLoading={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>
    </ContentWrapper>
  );
}

function VaultDashboard({ secrets, isLoading }: { secrets?: VaultSecret[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl border border-white/10" />
        ))}
      </div>
    );
  }

  const activeCount = secrets?.length || 0;
  const categories = new Set(secrets?.map(s => s.category)).size;
  const providers = new Set(secrets?.map(s => s.provider)).size;
  const recentlyUpdated = secrets?.filter(s => (new Date().getTime() - new Date(s.updatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000).length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Shield className="w-5 h-5 text-emerald-400" />} label="Active Secrets" value={activeCount} />
        <StatCard icon={<Box className="w-5 h-5 text-indigo-400" />} label="Categories" value={categories} />
        <StatCard icon={<Cloud className="w-5 h-5 text-blue-400" />} label="Providers" value={providers} />
        <StatCard icon={<Clock className="w-5 h-5 text-amber-400" />} label="Recently Rotated (7d)" value={recentlyUpdated} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unsupported Stats Display */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-medium text-white mb-6">Disabled & Expiring Secrets</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-slate-500" />
            </div>
            <h4 className="text-white font-medium text-lg mb-2">Backend Support Required</h4>
            <p className="text-slate-400 text-sm max-w-sm">
              The current backend API only exposes active secrets. Metrics for disabled, expiring, or revoked secrets are not currently available via the API.
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-medium text-white mb-6">Usage Summary</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-slate-500" />
            </div>
            <h4 className="text-white font-medium text-lg mb-2">Backend Support Required</h4>
            <p className="text-slate-400 text-sm max-w-sm">
              The backend does not currently expose usage relationships for AI Agents, Workflows, or Integrations.
            </p>
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
                <th className="p-4 font-medium">Secret Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Provider</th>
                <th className="p-4 font-medium">Created Date</th>
                <th className="p-4 font-medium">Updated Date</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-4"><div className="w-32 h-4 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="w-20 h-5 bg-white/5 rounded-full animate-pulse" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-white/5 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-white/5 rounded animate-pulse" /></td>
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
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={secret.id} 
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/vault/${secret.id}`)}
                  >
                    <td className="p-4">
                      <div className="font-medium text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-slate-400" /> {secret.name}
                      </div>
                      {secret.description && <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{secret.description}</div>}
                    </td>
                    <td className="p-4">
                      <CategoryBadge category={secret.category} />
                    </td>
                    <td className="p-4 text-slate-300 text-sm">
                      {secret.provider}
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(secret.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(secret.updatedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors" onClick={e => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
