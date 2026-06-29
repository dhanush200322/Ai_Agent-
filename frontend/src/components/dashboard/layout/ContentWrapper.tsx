'use client';

import React from 'react';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10 space-y-8 animate-in fade-in duration-500">
      {children}
    </div>
  );
}
