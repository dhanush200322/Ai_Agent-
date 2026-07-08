'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/hooks/useDashboard';
import { NavigationMenu } from '../navigation/NavigationMenu';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar, isMobileMenuOpen, setMobileMenuOpen } = useDashboard();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMobileMenuOpen, setMobileMenuOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        layout
        className={`
          fixed top-0 left-0 bottom-0 z-50 
          bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border-r border-[rgba(255,255,255,0.05)]
          flex flex-col shadow-2xl transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}
        `}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center px-4 border-b border-[rgba(255,255,255,0.05)] flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 animate-coin-flip">
              <img src="/logo.png" alt="Nexora Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-semibold tracking-wide text-white text-lg">
                Nexora AI
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <NavigationMenu />

        {/* Collapse Toggle (Desktop Only) */}
        <div className="hidden lg:flex p-4 border-t border-[rgba(255,255,255,0.05)]">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center py-2 text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
