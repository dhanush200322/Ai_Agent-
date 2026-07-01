"use client";
import React from 'react';
import { CheckCircle2, ShieldCheck, Zap, Bot, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function BrandPanel() {
  return (
    <>
      <div className="z-10">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F7D774] flex items-center justify-center text-black font-bold text-xl">
            N
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Nexora AI</span>
        </Link>
        <p className="mt-8 text-3xl font-bold text-white leading-tight">
          Build. Deploy. Scale<br />
          <span className="text-[#D4AF37]">AI Agents.</span>
        </p>
      </div>

      <div className="my-12 z-10 relative">
        <div className="absolute inset-0 bg-[#D4AF37]/5 blur-3xl rounded-full" />
        <ul className="space-y-6 relative">
          <FeatureItem icon={<Bot className="w-5 h-5" />} title="Autonomous AI Agents" />
          <FeatureItem icon={<Database className="w-5 h-5" />} title="Enterprise Knowledge Bases" />
          <FeatureItem icon={<Zap className="w-5 h-5" />} title="Visual Workflow Builder" />
          <FeatureItem icon={<ShieldCheck className="w-5 h-5" />} title="Bank-Grade Security" />
        </ul>
      </div>

      <div className="z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0B0B0B] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 bg-cover bg-center`} style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=18181b')` }} />
            ))}
          </div>
          <div className="text-sm text-zinc-400">
            <span className="text-white font-semibold">10,000+</span> teams building agents
          </div>
        </div>
      </div>
    </>
  );
}

function FeatureItem({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <motion.li 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-4 text-zinc-300"
    >
      <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-[#D4AF37]">
        {icon}
      </div>
      <span className="text-lg font-medium">{title}</span>
    </motion.li>
  );
}
