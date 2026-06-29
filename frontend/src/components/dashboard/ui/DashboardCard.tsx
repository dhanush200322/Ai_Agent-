'use client';

import React from 'react';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'metric' | 'glass';
}

export function DashboardCard({ 
  title, 
  subtitle, 
  children, 
  action, 
  className = '', 
  variant = 'default' 
}: DashboardCardProps) {
  
  const baseClasses = "rounded-xl overflow-hidden transition-all duration-300";
  
  const variantClasses = {
    default: "bg-[rgba(15,15,15,0.6)] border border-[rgba(255,255,255,0.05)]",
    metric: "bg-gradient-to-br from-[rgba(20,20,20,0.8)] to-[rgba(10,10,10,0.9)] border border-[rgba(255,255,255,0.02)] shadow-xl",
    glass: "bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-gray-200">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
