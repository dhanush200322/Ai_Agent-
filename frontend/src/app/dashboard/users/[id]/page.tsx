'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { useUser, useUpdateUserStatus } from '@/services/users/users.service';
import { ArrowLeft, User as UserIcon, Shield, Clock, Lock, Building2, CheckCircle2, XCircle, AlertCircle, Mail, Phone, Calendar } from 'lucide-react';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<'profile' | 'role' | 'sessions' | 'security' | 'organization'>('profile');

  const { data: user, isLoading } = useUser(id);
  const statusMutation = useUpdateUserStatus();

  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="h-40 bg-white/5 animate-pulse rounded-xl mb-8" />
        <div className="h-96 bg-white/5 animate-pulse rounded-xl" />
      </ContentWrapper>
    );
  }

  if (!user) {
    return (
      <ContentWrapper>
        <div className="text-center py-20 text-slate-400">User not found.</div>
      </ContentWrapper>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'role', label: 'Role & Access', icon: <Shield className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'organization', label: 'Organization', icon: <Building2 className="w-4 h-4" /> },
  ] as const;

  return (
    <ContentWrapper>
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* User Header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl mb-6 flex flex-col md:flex-row items-center gap-6">
        {user.avatar ? (
          <img src={user.avatar} alt={user.firstName} className="w-24 h-24 rounded-full object-cover border-4 border-white/5" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl font-medium border-4 border-white/5">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
            {user.firstName} {user.lastName}
            {user.isOwner && <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">Owner</span>}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> {user.role?.name}</span>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 
              user.status === 'SUSPENDED' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'
            }`}>
              {user.status === 'ACTIVE' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {user.status === 'SUSPENDED' && <XCircle className="w-3.5 h-3.5" />}
              {user.status === 'INACTIVE' && <AlertCircle className="w-3.5 h-3.5" />}
              {user.status}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {user.status !== 'ACTIVE' && (
            <button 
              onClick={() => statusMutation.mutate({ id, status: 'ACTIVE' })}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium transition-colors border border-emerald-500/20"
            >
              Activate
            </button>
          )}
          {user.status !== 'SUSPENDED' && !user.isOwner && (
            <button 
              onClick={() => statusMutation.mutate({ id, status: 'SUSPENDED' })}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-sm font-medium transition-colors border border-rose-500/20"
            >
              Suspend
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-white/5 border border-white/10 rounded-lg mb-6 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">First Name</p>
                  <p className="text-white font-medium bg-black/20 px-4 py-2 rounded-lg border border-white/5">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Last Name</p>
                  <p className="text-white font-medium bg-black/20 px-4 py-2 rounded-lg border border-white/5">{user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Email</p>
                  <p className="text-white font-medium bg-black/20 px-4 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" /> {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Phone</p>
                  <p className="text-white font-medium bg-black/20 px-4 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> {user.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Joined Date</p>
                  <p className="text-white font-medium bg-black/20 px-4 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" /> {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'role' && (
            <motion.div key="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <h3 className="text-lg font-medium text-white mb-4">Role Assignment</h3>
               <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium text-indigo-400 flex items-center gap-2"><Shield className="w-4 h-4" /> {user.role?.name || 'No Role Assigned'}</div>
                    <p className="text-sm text-indigo-300/70 mt-1">This user inherits all permissions associated with this role.</p>
                  </div>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm transition-colors">Change Role</button>
               </div>
            </motion.div>
          )}

          {/* Placeholder for other tabs based on backend support */}
          {['sessions', 'security', 'organization'].includes(activeTab) && (
             <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-white font-medium text-lg mb-2">Detailed {activeTab} data is unavailable</h3>
                <p className="text-slate-400 text-sm max-w-sm">The backend currently does not expose detailed {activeTab} information for individual users via the admin API.</p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ContentWrapper>
  );
}
