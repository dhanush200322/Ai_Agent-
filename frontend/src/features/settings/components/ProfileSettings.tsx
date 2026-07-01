import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { useUpdateProfile } from '@/services/profile/profile.service';
import { User, Save, Loader2, Mail } from 'lucide-react';

export function ProfileSettings() {
  const user = useAuthStore(state => state.user);
  const updateMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl">
      <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 backdrop-blur-xl mb-8">
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#D4AF37]" /> Profile Information
        </h3>
        
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-zinc-800">
          <div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-zinc-500 font-medium">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors mb-2">
              Change Avatar
            </button>
            <p className="text-xs text-zinc-500">JPG, GIF or PNG. Max size 5MB.</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">First Name</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Last Name</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
            <div className="relative max-w-md">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                value={user?.email || ''}
                readOnly
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-zinc-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">Email address cannot be changed.</p>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F7D774] text-black px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </button>
            {updateMutation.isSuccess && <span className="text-emerald-400 text-sm">Profile updated</span>}
            {updateMutation.isError && <span className="text-rose-400 text-sm">Update failed</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
