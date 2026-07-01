import React, { useState } from 'react';
import { useOrganization, useUpdateOrganization, useTransferOwnership } from '@/services/organization/organization.service';
import { Building2, Settings, Save, Loader2, Shield } from 'lucide-react';

export function OrganizationSettings() {
  const { data: org, isLoading: isLoadingOrg } = useOrganization();
  const updateMutation = useUpdateOrganization();
  const transferMutation = useTransferOwnership();

  const [formData, setFormData] = useState({
    name: org?.name || '',
    website: org?.website || '',
    industry: org?.industry || '',
    country: org?.country || '',
    timezone: org?.timezone || '',
  });
  const [newOwnerId, setNewOwnerId] = useState('');

  // Update form data when org loads
  React.useEffect(() => {
    if (org) {
      setFormData({
        name: org.name || '',
        website: org.website || '',
        industry: org.industry || '',
        country: org.country || '',
        timezone: org.timezone || '',
      });
    }
  }, [org]);

  if (isLoadingOrg) {
    return <div className="h-96 bg-zinc-900/50 animate-pulse rounded-xl border border-zinc-800" />;
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOwnerId) transferMutation.mutate(newOwnerId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Basic Settings */}
      <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#D4AF37]" /> General Settings
        </h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Organization Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Website</label>
            <input 
              type="text" 
              value={formData.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Industry</label>
            <input 
              type="text" 
              value={formData.industry}
              onChange={e => setFormData({...formData, industry: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Country</label>
            <input 
              type="text" 
              value={formData.country}
              onChange={e => setFormData({...formData, country: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F7D774] text-black px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
          {updateMutation.isSuccess && <p className="text-emerald-400 text-sm">Settings updated successfully.</p>}
        </form>
      </div>

      {/* Transfer Ownership */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-400" /> Danger Zone
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Transfer ownership of this organization to another user. This action cannot be undone.
          </p>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">New Owner ID</label>
              <input 
                type="text" 
                placeholder="Enter User UUID"
                value={newOwnerId}
                onChange={e => setNewOwnerId(e.target.value)}
                className="w-full bg-zinc-950 border border-rose-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
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
