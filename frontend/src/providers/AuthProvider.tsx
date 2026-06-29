"use client";
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store';


export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Wait for hydration
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; 
  }

  return <>{children}</>;
}
