'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { useCreateSecret } from '@/services/vault/vault.service';
import { ArrowLeft, Key, Save, Loader2, AlertCircle } from 'lucide-react';

export default function CreateSecretPage() {
  const router = useRouter();
  const createMutation = useCreateSecret();
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    category: 'API_KEY', // Default
    description: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.value || !formData.category) {
      setError('Name, Value, and Category are required.');
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        router.push('/dashboard/vault?tab=secrets');
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Failed to create secret. Please try again.');
      }
    });
  };

  return (
    <ContentWrapper>
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Vault
      </button>

      <PageHeader 
        title="Create New Secret"
        description="Securely store a new credential, API key, or certificate."
      />

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-xl max-w-2xl mt-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Secret Details</h3>
            <p className="text-sm text-slate-400">Values are encrypted before being stored in the database.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Secret Name <span className="text-rose-400">*</span></label>
            <input 
              type="text" 
              required
              placeholder="e.g. OPENAI_API_KEY"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Secret Value <span className="text-rose-400">*</span></label>
            <input 
              type="password" 
              required
              placeholder="Enter the sensitive value..."
              value={formData.value}
              onChange={e => setFormData({...formData, value: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Category <span className="text-rose-400">*</span></label>
            <select 
              required
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option className="bg-slate-900 text-white" value="AI_PROVIDER">AI Model Provider</option>
              <option className="bg-slate-900 text-white" value="DATABASE">Database Credentials</option>
              <option className="bg-slate-900 text-white" value="API_KEY">Generic API Key</option>
              <option className="bg-slate-900 text-white" value="SMTP">SMTP / Email Service</option>
              <option className="bg-slate-900 text-white" value="OAUTH">OAuth Credentials</option>
              <option className="bg-slate-900 text-white" value="PAYMENT">Payment Gateway</option>
              <option className="bg-slate-900 text-white" value="PLUGIN">Plugin Credentials</option>
              <option className="bg-slate-900 text-white" value="JWT">JWT Secret</option>
              <option className="bg-slate-900 text-white" value="CUSTOM">Custom / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
            <textarea 
              placeholder="Optional context about what this secret is used for..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-6 flex items-center gap-4">
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Secret
            </button>
            <button 
              type="button" 
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ContentWrapper>
  );
}
