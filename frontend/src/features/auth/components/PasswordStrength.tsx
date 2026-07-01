"use client";
import React from 'react';
import { motion } from 'framer-motion';

export function PasswordStrength({ password }: { password?: string }) {
  if (!password) return null;

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4); // Max score is 4
  };

  const strength = calculateStrength(password);
  
  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-red-500';
    if (score === 1) return 'bg-orange-500';
    if (score === 2) return 'bg-yellow-500';
    if (score === 3) return 'bg-lime-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return 'Very Weak';
    if (score === 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1 h-1.5 w-full">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`h-full flex-1 rounded-full transition-colors duration-300 ${
              index <= strength - 1 ? getStrengthColor(strength) : 'bg-[rgba(255,255,255,0.1)]'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-zinc-500">Password strength</span>
        <span className={`font-medium ${strength > 0 ? getStrengthColor(strength).replace('bg-', 'text-') : 'text-zinc-500'}`}>
          {getStrengthLabel(strength)}
        </span>
      </div>
    </div>
  );
}
