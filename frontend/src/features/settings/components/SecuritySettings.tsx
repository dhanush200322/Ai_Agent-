import React, { useState } from 'react';
import { useChangePassword, useSessions, useRevokeSession, useRevokeAllSessions } from '@/services/profile/profile.service';
import { Shield, Key, Smartphone, Laptop, Loader2, LogOut, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function SecuritySettings() {
  const changePasswordMutation = useChangePassword();
  const { data: sessions = [], isLoading: isLoadingSessions } = useSessions();
  const revokeMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllSessions();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwords.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
      {
        onSuccess: () => {
          setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (err: any) => {
          setPasswordError(err.response?.data?.message || 'Failed to change password');
        }
      }
    );
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Change Password */}
      <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-[#D4AF37]" /> Change Password
        </h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Current Password</label>
            <input 
              type="password" 
              value={passwords.currentPassword}
              onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">New Password</label>
            <input 
              type="password" 
              value={passwords.newPassword}
              onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              value={passwords.confirmPassword}
              onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          
          {passwordError && (
            <div className="text-rose-400 text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {passwordError}
            </div>
          )}
          {changePasswordMutation.isSuccess && (
            <div className="text-emerald-400 text-sm">Password updated successfully.</div>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={changePasswordMutation.isPending}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {changePasswordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Factor Authentication */}
      <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#D4AF37]" /> Multi-Factor Authentication
        </h3>
        <p className="text-zinc-400 text-sm mb-6">
          Add an extra layer of security to your account by enabling Multi-Factor Authentication.
        </p>
        <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Enable MFA
        </button>
      </div>

      {/* Active Sessions */}
      <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#D4AF37]" /> Active Sessions
          </h3>
          <button 
            onClick={() => revokeAllMutation.mutate()}
            disabled={revokeAllMutation.isPending || sessions.length <= 1}
            className="text-rose-400 hover:text-rose-300 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
          >
            {revokeAllMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Sign out of all other devices
          </button>
        </div>

        {isLoadingSessions ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-zinc-900/50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {sessions.map((session) => (
              <div key={session.id} className="py-4 flex items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    {session.device === 'Mobile' ? <Smartphone className="w-5 h-5 text-zinc-400" /> : <Laptop className="w-5 h-5 text-zinc-400" />}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm flex items-center gap-2">
                      {session.os || 'Unknown OS'} - {session.browser || 'Unknown Browser'}
                      {session.isCurrentSession && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Current</span>
                      )}
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                      {session.ipAddress} • Last active {new Date(session.lastActive).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!session.isCurrentSession && (
                  <button 
                    onClick={() => revokeMutation.mutate(session.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-2 transition-all"
                    title="Revoke session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-zinc-500 text-sm py-4">No active sessions found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
