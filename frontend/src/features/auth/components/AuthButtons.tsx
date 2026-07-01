import React from 'react';
import Link from 'next/link';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Loader2 } from 'lucide-react';

export function LoadingButton({ children, isLoading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) {
  return (
    <MagneticButton 
      variant="primary"
      disabled={isLoading || props.disabled}
      className="w-full relative group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
      {...(props as any)}
    >
      <div className="flex items-center justify-center">
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        <span className="font-semibold">{children}</span>
      </div>
      
      {/* Shine effect */}
      {!isLoading && !props.disabled && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
      )}
    </MagneticButton>
  );
}

export function ForgotPasswordLink() {
  return (
    <div className="text-right mt-2">
      <Link href="/forgot-password" className="text-sm font-medium text-zinc-400 hover:text-[#D4AF37] transition-colors">
        Forgot Password?
      </Link>
    </div>
  );
}

export function BackToLoginButton() {
  return (
    <div className="text-center mt-6">
      <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-[#D4AF37] transition-colors">
        Already have an account? Sign In
      </Link>
    </div>
  );
}
