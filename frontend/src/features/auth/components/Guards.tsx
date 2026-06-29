"use client";
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { useRouter } from 'next/navigation';
import { GlobalLoading } from '@/components/common/GlobalLoading';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (!mounted || status === 'unauthenticated') return <GlobalLoading />;
  
  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'authenticated') {
      router.replace('/dashboard'); // or generic home
    }
  }, [status, router]);

  if (!mounted || status === 'authenticated') return <GlobalLoading />;

  return <>{children}</>;
}
