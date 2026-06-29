'use client';

import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';

export function QuickActions() {
  return (
    <div className="flex items-center gap-2">
      <MagneticButton 
        className="px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded-lg text-sm font-medium transition-colors flex items-center justify-center text-gray-200"
      >
        <MoreHorizontal className="w-4 h-4" />
      </MagneticButton>
      <MagneticButton 
        className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
      >
        <Plus className="w-4 h-4" />
        <span>Create New</span>
      </MagneticButton>
    </div>
  );
}
