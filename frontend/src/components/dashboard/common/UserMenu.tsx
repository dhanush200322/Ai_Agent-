'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/services';
import { User, Settings, CreditCard, HelpCircle, LogOut, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      logout();
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors"
      >
        <span className="text-sm font-medium text-gray-200 hidden md:block">
          {user?.firstName}
        </span>
        <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </>
          ) : (
            <span className="text-xs font-bold">{getInitials()}</span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-[rgba(15,15,15,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
              <p className="font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
                {user?.isOwner ? 'Owner' : 'User'}
              </div>
            </div>
            
            <div className="p-2 space-y-1">
              <button onClick={() => { setIsOpen(false); router.push('/dashboard/settings'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors">
                <User className="w-4 h-4 text-gray-400" />
                Profile
              </button>
              <button onClick={() => { setIsOpen(false); router.push('/dashboard/billing'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors">
                <CreditCard className="w-4 h-4 text-gray-400" />
                Billing
              </button>
            </div>

            <div className="p-2 border-t border-[rgba(255,255,255,0.05)] space-y-1">
              <button onClick={() => { setIsOpen(false); router.push('/dashboard/support'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors">
                <HelpCircle className="w-4 h-4 text-gray-400" />
                Help & Support
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
