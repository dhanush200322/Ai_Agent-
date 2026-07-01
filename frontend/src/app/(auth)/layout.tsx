import { GuestGuard } from '@/features/auth/components/Guards';
import React from 'react';
import { BrandPanel } from '@/features/auth/components/BrandPanel';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="min-h-screen w-full flex bg-[#050505]">
        {/* Left Panel - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between border-r border-[rgba(255,255,255,0.05)] bg-[#0B0B0B] p-12 relative overflow-hidden">
          <BrandPanel />
        </div>

        {/* Right Panel - Auth Content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-[#050505] relative overflow-y-auto">
          {/* subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/[0.03] blur-[120px] rounded-full pointer-events-none" />
          
          <div className="w-full max-w-md mx-auto relative z-10">
            {children}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
