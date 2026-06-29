'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { Menu } from 'lucide-react';
import { CommandPalette } from '../common/CommandPalette';
import { NotificationBell } from '../common/NotificationBell';
import { UserMenu } from '../common/UserMenu';
import { OrganizationSwitcher } from '../common/OrganizationSwitcher';

export function TopNavigation() {
  const { toggleMobileMenu } = useDashboard();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[rgba(5,5,5,0.8)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-4 lg:px-8">
      
      {/* Left section: Mobile menu toggle & Org Switcher */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden sm:block">
          <OrganizationSwitcher />
        </div>
      </div>

      {/* Right section: Search, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:block">
          <CommandPalette />
        </div>
        
        <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] mx-2 hidden sm:block"></div>
        
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
