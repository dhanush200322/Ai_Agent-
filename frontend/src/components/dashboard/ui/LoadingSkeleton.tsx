'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  variant?: 'card' | 'text' | 'avatar' | 'title' | 'table-row';
  className?: string;
}

export function LoadingSkeleton({ variant = 'text', className = '' }: SkeletonProps) {
  const baseClasses = "bg-[rgba(255,255,255,0.05)] relative overflow-hidden";
  
  const variantClasses = {
    card: "rounded-xl w-full h-48",
    text: "rounded h-4 w-full",
    title: "rounded h-8 w-3/4",
    avatar: "rounded-full w-10 h-10",
    'table-row': "rounded h-12 w-full"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.05)] to-transparent"
        animate={{
          translateX: ['-100%', '100%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear"
        }}
      />
    </div>
  );
}
