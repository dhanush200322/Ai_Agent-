import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description?: string;
  icon?: any;
}

export function ProfessionalPlaceholder({ title, description, icon: Icon = Lock }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[rgba(20,20,20,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-2xl p-8 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-50" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-6">
            <Icon className="w-8 h-8 text-zinc-500" />
          </div>

          <h2 className="text-xl font-semibold text-white mb-3">
            {title}
          </h2>
          
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            {description || 'This module is currently unavailable. Backend configuration is required before this feature can be enabled.'}
          </p>

          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 py-2 px-4 rounded-full border border-zinc-800">
            <ShieldAlert className="w-3 h-3 text-zinc-400" />
            Enterprise Configuration Required
          </div>
        </div>
      </motion.div>
    </div>
  );
}
