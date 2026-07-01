'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { useOrganization, useOrganizationStats, useUpdateOrganization, useTransferOwnership } from '@/services/organization/organization.service';
import { Building2, Users, Bot, GitMerge, Database, HardDrive, Settings, Activity, UserPlus, Save, Loader2, Shield } from 'lucide-react';

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const { data: org, isLoading: isLoadingOrg } = useOrganization();
  const { data: stats, isLoading: isLoadingStats } = useOrganizationStats();

  return (
    <ContentWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="Organization"
          description="Manage your enterprise organization, members, and settings."
        />
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview & Stats
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {isLoadingOrg || isLoadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl border border-white/10" />
                 ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard icon={<Users className="w-5 h-5 text-blue-400" />} label="Total Users" value={stats?.totalUsers || 0} />
                  <StatCard icon={<UserPlus className="w-5 h-5 text-green-400" />} label="Active Users" value={stats?.activeUsers || 0} />
                  <StatCard icon={<Bot className="w-5 h-5 text-purple-400" />} label="AI Agents" value={stats?.totalAgents || 0} />
                  <StatCard icon={<Database className="w-5 h-5 text-amber-400" />} label="Knowledge Bases" value={stats?.totalKnowledgeBases || 0} />
                  <StatCard icon={<GitMerge className="w-5 h-5 text-rose-400" />} label="Workflows" value={stats?.totalWorkflows || 0} />
                  <StatCard icon={<HardDrive className="w-5 h-5 text-cyan-400" />} label="Storage Used" value={`${((stats?.storageUsedBytes || 0) / (1024 * 1024)).toFixed(2)} MB`} />
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" /> Organization Info
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <p className="text-slate-400">Name</p>
                      <p className="text-white font-medium">{org?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Status</p>
                      <p className="text-emerald-400 font-medium">{org?.status}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Industry</p>
                      <p className="text-white font-medium">{org?.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Created At</p>
                      <p className="text-white font-medium">{new Date(org?.createdAt || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {isLoadingOrg ? (
              <div className="h-96 bg-white/5 animate-pulse rounded-xl border border-white/10" />
            ) : (
              <OrganizationSettings org={org} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ContentWrapper>
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

function OrganizationSettings({ org }: { org: any }) {
  const [formData, setFormData] = useState({
    name: org?.name || '',
    website: org?.website || '',
    industry: org?.industry || '',
    country: org?.country || '',
    timezone: org?.timezone || '',
  });
  const [newOwnerId, setNewOwnerId] = useState('');
  
  const updateMutation = useUpdateOrganization();
  const transferMutation = useTransferOwnership();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if(newOwnerId) transferMutation.mutate(newOwnerId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Basic Settings */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" /> General Settings
        </h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Organization Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Website</label>
            <input 
              type="text" 
              value={formData.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Industry</label>
            <input 
              type="text" 
              value={formData.industry}
              onChange={e => setFormData({...formData, industry: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Country</label>
            <input 
              type="text" 
              value={formData.country}
              onChange={e => setFormData({...formData, country: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
          {updateMutation.isSuccess && <p className="text-emerald-400 text-sm">Settings updated successfully.</p>}
        </form>
      </div>

      {/* Transfer Ownership */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-400" /> Danger Zone
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Transfer ownership of this organization to another user. This action cannot be undone.
          </p>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">New Owner ID</label>
              <input 
                type="text" 
                placeholder="Enter User UUID"
                value={newOwnerId}
                onChange={e => setNewOwnerId(e.target.value)}
                className="w-full bg-black/20 border border-rose-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={transferMutation.isPending || !newOwnerId}
              className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {transferMutation.isPending ? 'Transferring...' : 'Transfer Ownership'}
            </button>
            {transferMutation.isSuccess && <p className="text-emerald-400 text-sm">Ownership transferred.</p>}
            {transferMutation.isError && <p className="text-rose-400 text-sm">Failed to transfer ownership.</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
