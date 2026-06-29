import React from 'react';
import Link from 'next/link';

export function LoadingButton({ children, isLoading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) {
  return (
    <button 
      disabled={isLoading || props.disabled}
      className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      {...props}
    >
      {isLoading ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span> : null}
      {children}
    </button>
  );
}

export function ForgotPasswordLink() {
  return (
    <div className="text-right mt-1">
      <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline underline-offset-4">
        Forgot password?
      </Link>
    </div>
  );
}

export function BackToLoginButton() {
  return (
    <div className="text-center mt-4">
      <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary hover:underline underline-offset-4">
        Back to Login
      </Link>
    </div>
  );
}
