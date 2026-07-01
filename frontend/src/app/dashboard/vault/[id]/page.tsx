'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { useSecretMetadata, useRetrieveSecret, useRotateSecret, useRevokeSecret, useCreateLease } from '@/services/vault/vault.service';
import { ArrowLeft, Lock, Key, RefreshCw, Clock, Info, Shield, CheckCircle2, Eye, EyeOff, Copy, FileText, Share2, Trash2, Calendar, HardDrive, AlertCircle } from 'lucide-react';
import { CategoryBadge } from '@/components/dashboard/vault/CategoryBadge';

export default function SecretDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'value' | 'rotation' | 'lease' | 'metadata' | 'versions' | 'usage'>('overview');

  const { data: secret, isLoading } = useSecretMetadata(id);
  const revokeMutation = useRevokeSecret();

  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="h-40 bg-white/5 animate-pulse rounded-xl mb-8" />
        <div className="h-96 bg-white/5 animate-pulse rounded-xl" />
      </ContentWrapper>
    );
  }

  if (!secret) {
    return (
      <ContentWrapper>
        <div className="text-center py-20 text-slate-400">Secret not found or disabled.</div>
      </ContentWrapper>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Info className="w-4 h-4" /> },
    { id: 'value', label: 'Secret Value', icon: <Key className="w-4 h-4" /> },
    { id: 'rotation', label: 'Rotation', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'lease', label: 'Lease Access', icon: <Clock className="w-4 h-4" /> },
    { id: 'metadata', label: 'Metadata', icon: <FileText className="w-4 h-4" /> },
    { id: 'versions', label: 'Versions', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'usage', label: 'Usage', icon: <Share2 className="w-4 h-4" /> },
  ] as const;

  const handleRevoke = async () => {
    if (confirm('Are you sure you want to revoke this secret? This action will disable it and break any dependent services.')) {
      await revokeMutation.mutateAsync(id);
      router.push('/dashboard/vault');
    }
  };

  return (
    <ContentWrapper>
      <button 
        onClick={() => router.push('/dashboard/vault')} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Vault
      </button>

      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{secret.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <CategoryBadge category={secret.category} />
              <span className="text-sm text-slate-400">{secret.provider}</span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleRevoke}
          disabled={revokeMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-sm font-medium transition-colors border border-rose-500/20 whitespace-nowrap"
        >
          <Trash2 className="w-4 h-4" /> {revokeMutation.isPending ? 'Revoking...' : 'Revoke Secret'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-white/5 border border-white/10 rounded-lg mb-6 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-xl min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl">
              <h3 className="text-lg font-medium text-white mb-6">Overview</h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                {secret.description || 'No description provided for this secret.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Created At</p>
                  <p className="text-white font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-400" /> {new Date(secret.createdAt).toLocaleString()}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Last Updated</p>
                  <p className="text-white font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> {new Date(secret.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'value' && (
            <motion.div key="value" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SecretValueViewer secretId={id} />
            </motion.div>
          )}

          {activeTab === 'rotation' && (
            <motion.div key="rotation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RotationManager secretId={id} />
            </motion.div>
          )}

          {activeTab === 'lease' && (
            <motion.div key="lease" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LeaseManager secretId={id} />
            </motion.div>
          )}

          {activeTab === 'metadata' && (
            <motion.div key="metadata" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl">
              <h3 className="text-lg font-medium text-white mb-6">Internal Metadata</h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5">
                  <span className="text-slate-500">Secret ID</span>
                  <span className="text-indigo-300">{secret.id}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5">
                  <span className="text-slate-500">Encryption Standard</span>
                  <span className="text-emerald-300">AES-256-GCM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5">
                  <span className="text-slate-500">Storage Provider</span>
                  <span className="text-white">DATABASE</span>
                </div>
              </div>
            </motion.div>
          )}

          {['versions', 'usage'].includes(activeTab) && (
            <motion.div key="unsupported" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                {activeTab === 'versions' ? <HardDrive className="w-8 h-8 text-slate-400" /> : <Share2 className="w-8 h-8 text-slate-400" />}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 capitalize">{activeTab} History</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                This backend does not currently expose secret {activeTab === 'versions' ? 'version history' : 'usage relationships'} via the API. 
                <br/><br/>
                When the endpoint becomes available, all {activeTab === 'versions' ? 'previous secret versions' : 'dependent agents and workflows'} will automatically appear here.
              </p>
              <div className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-widest border border-indigo-500/20">
                Backend Support Required
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ContentWrapper>
  );
}

function SecretValueViewer({ secretId }: { secretId: string }) {
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [copied, setCopied] = useState(false);
  
  const { refetch, data, isFetching, error } = useRetrieveSecret(secretId);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (revealed && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setRevealed(false);
    }
    return () => clearInterval(timer);
  }, [revealed, timeLeft]);

  const handleReveal = async () => {
    // 1. In a real enterprise app, we might prompt for a password or MFA here.
    const res = await refetch();
    if (res.data) {
      setRevealed(true);
      setTimeLeft(15);
      setCopied(false);
    }
  };

  const handleCopy = () => {
    if (data?.value) {
      navigator.clipboard.writeText(data.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-medium text-white mb-2">Secure Secret Viewer</h3>
      <p className="text-sm text-slate-400 mb-8">For security reasons, decrypted secrets are never stored permanently in the frontend state and will auto-hide after 15 seconds.</p>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm mb-6">
          <AlertCircle className="w-4 h-4" /> Failed to decrypt secret or access denied.
        </div>
      )}

      <div className="bg-black/40 border border-white/10 rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 overflow-x-auto">
            <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2 block">Value</label>
            <div className="font-mono text-lg text-white break-all">
              {revealed ? data?.value : '••••••••••••••••••••••••••••••••'}
            </div>
            {revealed && (
              <p className="text-xs text-rose-400 mt-2 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Hiding in {timeLeft}s
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-2 shrink-0">
            {!revealed ? (
              <button 
                onClick={handleReveal}
                disabled={isFetching}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors min-w-[120px]"
              >
                {isFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Reveal
              </button>
            ) : (
              <>
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium transition-colors min-w-[120px]"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
                <button 
                  onClick={() => setRevealed(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-medium transition-colors min-w-[120px]"
                >
                  <EyeOff className="w-4 h-4" />
                  Hide
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RotationManager({ secretId }: { secretId: string }) {
  const [newValue, setNewValue] = useState('');
  const [success, setSuccess] = useState('');
  const rotateMutation = useRotateSecret();

  const handleManualRotate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue) return;
    rotateMutation.mutate({ id: secretId, newValue }, {
      onSuccess: () => {
        setSuccess('Secret rotated successfully.');
        setNewValue('');
        setTimeout(() => setSuccess(''), 3000);
      }
    });
  };

  const handleAutoRotate = () => {
    rotateMutation.mutate({ id: secretId }, {
      onSuccess: () => {
        setSuccess('Automated rotation job queued.');
        setTimeout(() => setSuccess(''), 3000);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-lg font-medium text-white mb-2 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-indigo-400" /> Manual Rotation</h4>
        <p className="text-sm text-slate-400 mb-6">Manually provide a new value for this secret. The previous version will be preserved in the database.</p>
        
        <form onSubmit={handleManualRotate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">New Secret Value</label>
            <input 
              type="password" 
              required
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <button 
            type="submit" 
            disabled={rotateMutation.isPending || !newValue}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {rotateMutation.isPending && newValue ? 'Rotating...' : 'Rotate Secret'}
          </button>
        </form>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-lg font-medium text-white mb-2 flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-400" /> Automated Rotation</h4>
        <p className="text-sm text-slate-400 mb-6">Trigger the rotation engine to automatically generate and apply a new secure value for this secret.</p>
        
        <button 
          onClick={handleAutoRotate}
          disabled={rotateMutation.isPending}
          className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg font-medium transition-colors mt-auto"
        >
          Trigger Auto-Rotation Job
        </button>
      </div>

      {success && (
        <div className="col-span-1 md:col-span-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Rotation History Placeholder */}
      <div className="col-span-1 md:col-span-2 mt-4 p-6 bg-black/20 border border-white/5 rounded-xl text-center">
        <p className="text-slate-400 text-sm mb-2">Rotation History API is not yet exposed by the backend.</p>
        <p className="text-xs text-slate-500">Once available, this section will display Previous Versions, Rotation Dates, and Rotated By actors.</p>
      </div>
    </div>
  );
}

function LeaseManager({ secretId }: { secretId: string }) {
  const [ttl, setTtl] = useState(3600);
  const [leaseId, setLeaseId] = useState('');
  const leaseMutation = useCreateLease();

  const handleCreateLease = (e: React.FormEvent) => {
    e.preventDefault();
    leaseMutation.mutate({ id: secretId, ttlSeconds: ttl, actorType: 'USER' }, {
      onSuccess: (data: any) => {
        setLeaseId(data.leaseId);
      }
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(leaseId);
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-400" /> Temporary Access Lease</h3>
      <p className="text-sm text-slate-400 mb-8">Generate a temporary, time-bound lease ID to safely grant access to this secret without exposing the raw value.</p>

      {!leaseId ? (
        <form onSubmit={handleCreateLease} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Time To Live (TTL)</label>
            <div className="grid grid-cols-3 gap-4">
              {[600, 3600, 86400].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTtl(val)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                    ttl === val ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {val === 600 ? '10 Minutes' : val === 3600 ? '1 Hour' : '24 Hours'}
                </button>
              ))}
            </div>
          </div>
          <button 
            type="submit" 
            disabled={leaseMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            {leaseMutation.isPending ? 'Generating Lease...' : 'Generate Temporary Lease'}
          </button>
        </form>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-full"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
            <div>
              <h4 className="text-emerald-400 font-medium text-lg">Lease Generated</h4>
              <p className="text-emerald-500/70 text-sm">Valid for {ttl / 60} minutes</p>
            </div>
          </div>
          
          <div className="bg-black/40 p-4 rounded-lg border border-white/10 flex items-center justify-between gap-4">
            <code className="text-white font-mono text-sm truncate">{leaseId}</code>
            <button 
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm text-white transition-colors"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          
          <p className="text-xs text-slate-500 mt-4 text-center">
            You can use this Lease ID via the API: <code className="text-indigo-300">GET /vault/lease/{leaseId}</code>
          </p>
          
          <button 
            onClick={() => setLeaseId('')}
            className="w-full mt-6 text-slate-400 hover:text-white text-sm transition-colors"
          >
            Create Another Lease
          </button>
        </div>
      )}
    </div>
  );
}
