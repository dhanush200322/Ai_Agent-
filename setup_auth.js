const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'frontend', 'src');

const files = {
  // Types
  'features/auth/types/index.ts': `
export interface User {
  id: string;
  email: string;
  name: string;
  roles?: string[];
}
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
}
`,

  // Schemas
  'features/auth/schemas/index.ts': `
import { z } from 'zod';
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});
export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm Password is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
`,

  // Store
  'features/auth/store/index.ts': `
import { create } from 'zustand';
import { AuthState } from '../types';

interface AuthStore extends AuthState {
  setUser: (user: AuthState['user']) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'unauthenticated',
  setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  logout: () => set({ user: null, accessToken: null, refreshToken: null, status: 'unauthenticated' }),
}));
`,

  // Services
  'features/auth/services/index.ts': `
// Placeholder services. Do not implement API calls yet.
export const authService = {
  login: async (data: any) => Promise.resolve(),
  register: async (data: any) => Promise.resolve(),
  logout: async () => Promise.resolve(),
  forgotPassword: async (data: any) => Promise.resolve(),
  resetPassword: async (data: any) => Promise.resolve(),
  refreshSession: async () => Promise.resolve(),
  getCurrentUser: async () => Promise.resolve(),
};
`,

  // Components - Auth Layout & Card
  'features/auth/components/AuthLayout.tsx': `
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
`,

  'features/auth/components/AuthIllustration.tsx': `
export function AuthIllustration() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center p-8">
        <div className="mx-auto mb-8 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse"></div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Enterprise AI Agent Platform</h2>
        <p className="text-muted-foreground text-lg">Manage, orchestrate, and deploy AI agents securely.</p>
      </div>
    </div>
  );
}
`,

  'features/auth/components/AuthCard.tsx': `
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
      {children}
    </div>
  );
}
`,

  'features/auth/components/AuthHeader.tsx': `
export function AuthHeader({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col space-y-2 text-center mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
`,

  'features/auth/components/AuthFooter.tsx': `
export function AuthFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
`,

  'features/auth/components/AuthFormWrapper.tsx': `
export function AuthFormWrapper({ children, onSubmit }: { children: React.ReactNode, onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
    </form>
  );
}
`,

  'features/auth/components/AuthInputs.tsx': `
import React from 'react';

export const EmailInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <div className="space-y-2">
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
    <input 
      ref={ref}
      type="email" 
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props} 
    />
  </div>
));
EmailInput.displayName = 'EmailInput';

export const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <div className="space-y-2">
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
    <input 
      ref={ref}
      type="password" 
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props} 
    />
  </div>
));
PasswordInput.displayName = 'PasswordInput';

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(({ label, className, ...props }, ref) => (
  <div className="space-y-2">
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>
    <input 
      ref={ref}
      type="text" 
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props} 
    />
  </div>
));
TextInput.displayName = 'TextInput';

export const CheckboxInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(({ label, className, ...props }, ref) => (
  <div className="flex items-center space-x-2">
    <input 
      ref={ref}
      type="checkbox" 
      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      {...props} 
    />
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>
  </div>
));
CheckboxInput.displayName = 'CheckboxInput';
`,

  'features/auth/components/AuthButtons.tsx': `
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
`,

  'features/auth/components/Guards.tsx': `
import React from 'react';
import { useAuthStore } from '../store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  // Placeholder: In real app, this would redirect if unauthenticated.
  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  // Placeholder: In real app, this would redirect if already authenticated.
  return <>{children}</>;
}
`,

  'features/auth/components/AuthStates.tsx': `
export function AuthErrorState({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">{message}</div>;
}

export function AuthSuccessState({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="p-3 text-sm text-green-600 bg-green-500/10 rounded-md border border-green-500/20">{message}</div>;
}
`,

  // Forms
  'features/auth/forms/LoginForm.tsx': `
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../schemas";
import { AuthFormWrapper } from "../components/AuthFormWrapper";
import { EmailInput, PasswordInput, CheckboxInput } from "../components/AuthInputs";
import { LoadingButton, ForgotPasswordLink } from "../components/AuthButtons";
import { AuthErrorState } from "../components/AuthStates";
import { useState } from "react";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      <div>
        <EmailInput {...register("email")} />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <PasswordInput {...register("password")} />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        <ForgotPasswordLink />
      </div>
      <div>
        <CheckboxInput label="Remember me" {...register("rememberMe")} />
      </div>
      <LoadingButton isLoading={isLoading} type="submit">Sign In</LoadingButton>
    </AuthFormWrapper>
  );
}
`,

  'features/auth/forms/RegisterForm.tsx': `
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "../schemas";
import { AuthFormWrapper } from "../components/AuthFormWrapper";
import { EmailInput, PasswordInput, TextInput } from "../components/AuthInputs";
import { LoadingButton } from "../components/AuthButtons";
import { useState } from "react";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      <div>
        <TextInput label="Full Name" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <EmailInput {...register("email")} />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <PasswordInput {...register("password")} />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <LoadingButton isLoading={isLoading} type="submit">Create Account</LoadingButton>
    </AuthFormWrapper>
  );
}
`,

  'features/auth/forms/ForgotPasswordForm.tsx': `
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "../schemas";
import { AuthFormWrapper } from "../components/AuthFormWrapper";
import { EmailInput } from "../components/AuthInputs";
import { LoadingButton } from "../components/AuthButtons";
import { AuthSuccessState } from "../components/AuthStates";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      {isSuccess && <AuthSuccessState message="Password reset link has been sent to your email." />}
      <div>
        <EmailInput {...register("email")} />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <LoadingButton isLoading={isLoading} type="submit">Send Reset Link</LoadingButton>
    </AuthFormWrapper>
  );
}
`,

  'features/auth/forms/ResetPasswordForm.tsx': `
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormValues } from "../schemas";
import { AuthFormWrapper } from "../components/AuthFormWrapper";
import { PasswordInput } from "../components/AuthInputs";
import { LoadingButton } from "../components/AuthButtons";
import { AuthSuccessState } from "../components/AuthStates";
import { useState } from "react";

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      {isSuccess && <AuthSuccessState message="Your password has been successfully reset." />}
      <div>
        <PasswordInput placeholder="New Password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <PasswordInput placeholder="Confirm New Password" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <LoadingButton isLoading={isLoading} type="submit">Reset Password</LoadingButton>
    </AuthFormWrapper>
  );
}
`,

  // Pages
  'app/(auth)/layout.tsx': `
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GuestGuard } from '@/features/auth/components/Guards';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <AuthLayout>
        {children}
      </AuthLayout>
    </GuestGuard>
  );
}
`,

  'app/(auth)/login/page.tsx': `
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { AuthFooter } from '@/features/auth/components/AuthFooter';
import { LoginForm } from '@/features/auth/forms/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthHeader title="Welcome Back" description="Enter your credentials to access your account." />
      <LoginForm />
      <AuthFooter>
        Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link>
      </AuthFooter>
    </AuthCard>
  );
}
`,

  'app/(auth)/register/page.tsx': `
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { AuthFooter } from '@/features/auth/components/AuthFooter';
import { RegisterForm } from '@/features/auth/forms/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <AuthCard>
      <AuthHeader title="Create an Account" description="Sign up to start managing your AI agents." />
      <RegisterForm />
      <AuthFooter>
        Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
      </AuthFooter>
    </AuthCard>
  );
}
`,

  'app/(auth)/forgot-password/page.tsx': `
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { BackToLoginButton } from '@/features/auth/components/AuthButtons';
import { ForgotPasswordForm } from '@/features/auth/forms/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <AuthHeader title="Forgot Password" description="Enter your email to receive a reset link." />
      <ForgotPasswordForm />
      <BackToLoginButton />
    </AuthCard>
  );
}
`,

  'app/(auth)/reset-password/page.tsx': `
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { BackToLoginButton } from '@/features/auth/components/AuthButtons';
import { ResetPasswordForm } from '@/features/auth/forms/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <AuthHeader title="Reset Password" description="Enter a new password for your account." />
      <ResetPasswordForm />
      <BackToLoginButton />
    </AuthCard>
  );
}
`,

  'app/(auth)/verify-email/page.tsx': `
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { BackToLoginButton } from '@/features/auth/components/AuthButtons';

export default function VerifyEmailPage() {
  return (
    <AuthCard>
      <AuthHeader title="Verify Email" description="Please check your inbox and verify your email address." />
      <div className="flex justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">We've sent a verification link to your email address. Click the link to verify your account.</p>
      </div>
      <BackToLoginButton />
    </AuthCard>
  );
}
`,

  'app/(auth)/unauthorized/page.tsx': `
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { BackToLoginButton } from '@/features/auth/components/AuthButtons';

export default function UnauthorizedPage() {
  return (
    <AuthCard>
      <AuthHeader title="Access Denied" description="You do not have permission to view this page." />
      <BackToLoginButton />
    </AuthCard>
  );
}
`,

  'app/(auth)/session-expired/page.tsx': `
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import Link from 'next/link';

export default function SessionExpiredPage() {
  return (
    <AuthCard>
      <AuthHeader title="Session Expired" description="Your session has expired. Please log in again to continue." />
      <div className="mt-4">
        <Link href="/login" className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Return to Login
        </Link>
      </div>
    </AuthCard>
  );
}
`
};

Object.entries(files).forEach(([f, content]) => {
  const filePath = path.join(root, f);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trim() + '\\n');
});

console.log("Auth module generated successfully");
