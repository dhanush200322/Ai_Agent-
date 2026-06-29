import React from 'react';
import { AuthIllustration } from './AuthIllustration';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex w-full flex-col items-center justify-center p-4 lg:w-1/2 lg:p-8">
        {children}
      </div>
      <div className="hidden lg:block lg:w-1/2 bg-muted/30 border-l border-border/50">
        <AuthIllustration />
      </div>
    </div>
  );
}
