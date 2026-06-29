'use client';

import React from 'react';
import { Search } from 'lucide-react';

export function CommandPalette() {
  return (
    <button className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded-lg text-sm text-gray-400 transition-colors w-64">
      <Search className="w-4 h-4" />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-gray-500 bg-[rgba(255,255,255,0.1)] rounded">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
