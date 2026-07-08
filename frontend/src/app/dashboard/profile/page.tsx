'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { useAuthStore } from '@/features/auth/store';
import { useUpdateProfile, useChangePassword, useSessions, useRevokeSession, useRevokeAllSessions } from '@/services/profile/profile.service';
import { User, Lock, Clock, Shield, Upload, Monitor, Smartphone, Globe, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { useSubscription } from '@/services/billing/billing.service';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');
  const user = useAuthStore(state => state.user);

  return (
    <ContentWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="Account Settings"
          description="Manage your profile, security preferences, and active sessions."
        />
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'security' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" /> Security
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sessions' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Sessions
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ProfileSettings user={user} />
          </motion.div>
        )}
        {activeTab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SecuritySettings />
          </motion.div>
        )}
        {activeTab === 'sessions' && (
          <motion.div key="sessions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SessionManagement />
          </motion.div>
        )}
      </AnimatePresence>
    </ContentWrapper>
  );
}

function ProfileSettings({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  
  const updateMutation = useUpdateProfile();
  const { data: subscription } = useSubscription();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="col-span-1">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl flex flex-col items-center text-center">
          <div className="relative group mb-4">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="w-32 h-32 rounded-full object-cover border-4 border-white/5" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-4xl font-medium border-4 border-white/5">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Upload className="w-6 h-6 text-white mb-1" />
              <span className="text-xs text-white font-medium">Upload</span>
              <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const fd = new FormData();
                  fd.append('avatar', file);
                  updateMutation.mutate(fd);
                }
                e.target.value = '';
              }} />
            </label>
          </div>
          <h3 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h3>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <div className="mt-4 flex flex-col gap-2 w-full px-4">
            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-medium text-slate-300">
              Role: {user?.role?.name || 'User'}
            </div>
            {subscription && (
              <div className={`flex flex-col items-center gap-1 p-3 rounded-lg border ${subscription.plan?.name === 'Professional' ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-white/5 border-white/10'}`}>
                <div className={`font-bold flex items-center gap-1 ${subscription.plan?.name === 'Professional' ? 'text-[#D4AF37]' : 'text-slate-300'}`}>
                  {subscription.plan?.name === 'Professional' ? <Zap className="w-4 h-4" /> : null}
                  {subscription.plan?.name?.toUpperCase() || 'STARTER'}
                </div>
                <div className="text-xs text-slate-400">
                  {subscription.billingCycle} • Expires {new Date(subscription.expiryDate || subscription.renewalDate || '').toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="col-span-1 lg:col-span-2">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-medium text-white mb-6">Personal Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
              <input 
                type="email" 
                value={user?.email || ''}
                disabled
                className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Email address cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              {updateMutation.isSuccess && <span className="ml-4 text-emerald-400 text-sm">Profile updated!</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const pwMutation = useChangePassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }
    pwMutation.mutate({ oldPassword: passwords.current, newPassword: passwords.new }, {
      onError: (err: any) => setError(err.response?.data?.message || 'Failed to change password'),
      onSuccess: () => {
        setPasswords({ current: '', new: '', confirm: '' });
      }
    });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl max-w-2xl">
      <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-indigo-400" /> Change Password
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        {pwMutation.isSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4" /> Password changed successfully.
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
          <input 
            type="password" 
            required
            value={passwords.current}
            onChange={e => setPasswords({...passwords, current: e.target.value})}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
          <input 
            type="password"
            required 
            value={passwords.new}
            onChange={e => setPasswords({...passwords, new: e.target.value})}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
          <input 
            type="password" 
            required
            value={passwords.confirm}
            onChange={e => setPasswords({...passwords, confirm: e.target.value})}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button 
          type="submit" 
          disabled={pwMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {pwMutation.isPending ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

function SessionManagement() {
  const { data: sessions, isLoading } = useSessions();
  const revokeMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllSessions();

  if (isLoading) {
    return <div className="h-64 bg-white/5 animate-pulse rounded-xl border border-white/10" />;
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Active Sessions</h3>
          <p className="text-sm text-slate-400 mt-1">Manage devices currently logged into your account.</p>
        </div>
        <button 
          onClick={() => { if(confirm('Revoke all other sessions?')) revokeAllMutation.mutate() }}
          disabled={revokeAllMutation.isPending}
          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Revoke All Others
        </button>
      </div>

      <div className="space-y-4">
        {sessions?.map((session) => (
          <div key={session.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-full text-indigo-400">
                {session.device === 'Mobile' ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 text-white font-medium">
                  {session.os || 'Unknown OS'} • {session.browser || 'Unknown Browser'}
                  {session.isCurrentSession && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Current</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {session.ipAddress}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last active {new Date(session.lastActive).toLocaleString()}</span>
                </div>
              </div>
            </div>
            {!session.isCurrentSession && (
              <button 
                onClick={() => revokeMutation.mutate(session.id)}
                disabled={revokeMutation.isPending}
                className="text-rose-400 hover:text-rose-300 text-sm font-medium p-2"
              >
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
