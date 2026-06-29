'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ChevronsUpDown, Check, Building2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OrganizationSwitcher() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // In Phase 2, we just mock the organizations list with the user's primary org
  const activeOrganization = {
    id: user?.organizationId || 'org-1',
    name: 'CyberCorp (Demo)', // We'll just display a fallback or rely on user data if available. Since user object might not have org name deeply populated depending on backend return, we provide a fallback.
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors border border-transparent hover:border-[rgba(255,255,255,0.1)]"
      >
        <div className="w-5 h-5 rounded bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-gray-600">
          <Building2 className="w-3 h-3 text-gray-300" />
        </div>
        <span className="text-sm font-medium text-gray-200 hidden md:block">
          {activeOrganization.name}
        </span>
        <ChevronsUpDown className="w-3 h-3 text-gray-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-64 bg-[rgba(15,15,15,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Organizations
              </div>
              
              <button className="w-full flex items-center justify-between px-2 py-2 text-sm text-gray-200 bg-[rgba(255,255,255,0.05)] rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-gray-600">
                    <Building2 className="w-3 h-3 text-gray-300" />
                  </div>
                  <span className="font-medium">{activeOrganization.name}</span>
                </div>
                <Check className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
            
            <div className="p-2 border-t border-[rgba(255,255,255,0.05)]">
              <button disabled className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-500 rounded-lg cursor-not-allowed">
                <div className="w-5 h-5 rounded bg-[rgba(255,255,255,0.05)] flex items-center justify-center border border-dashed border-gray-600">
                  <Plus className="w-3 h-3" />
                </div>
                Create Organization
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
