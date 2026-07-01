import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Sparkles } from 'lucide-react';

interface ComingSoonProps {
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[600px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-[rgba(20,20,20,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-2xl p-8 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500">
            <Rocket className="w-8 h-8 text-[#D4AF37]" />
            <Sparkles className="w-4 h-4 text-[#D4AF37] absolute -top-1 -right-1 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
            {title}
          </h2>
          
          <p className="text-gray-400 mb-8 leading-relaxed">
            🚀 {title} is under active development. Coming Soon. We're building something amazing to help you scale your AI operations.
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500 bg-[rgba(0,0,0,0.2)] py-2 px-4 rounded-full border border-[rgba(255,255,255,0.05)]">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            Under active development
          </div>
        </div>
      </motion.div>
    </div>
  );
}
