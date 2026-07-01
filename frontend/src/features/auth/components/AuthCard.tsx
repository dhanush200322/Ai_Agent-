"use client";
import { motion } from 'framer-motion';
import React from 'react';

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full space-y-6 rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[#0B0B0B]/80 p-10 shadow-[0_0_60px_-15px_rgba(212,175,55,0.05)] backdrop-blur-xl relative overflow-hidden"
    >
      {/* Soft inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
