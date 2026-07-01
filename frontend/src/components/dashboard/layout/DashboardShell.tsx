'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useDashboard();

  return (
    <div className="relative min-h-screen bg-[#050505] text-gray-100 overflow-hidden flex">
      <Sidebar />
      
      <div 
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-[80px]' : 'md:pl-[280px]'
        }`}
      >
        <TopNavigation />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
