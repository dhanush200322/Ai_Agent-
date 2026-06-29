const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'frontend', 'src');

const files = {
  // Store
  'features/auth/store/index.ts': `
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';

interface AuthStore extends AuthState {
  setUser: (user: AuthState['user']) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: 'unauthenticated',
      setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, status: 'unauthenticated' }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
`,

  // Services
  'features/auth/services/index.ts': `
import { api } from '@/services/api/api';
import { LoginFormValues, ForgotPasswordFormValues } from '../schemas';

export const authService = {
  login: async (data: LoginFormValues) => {
    const response = await api.post('/auth/login', data);
    return response.data.data; // Expected: { accessToken, refreshToken, user }
  },
  
  register: async (data: any) => {
    throw new Error("Self-registration is disabled. Please contact your administrator.");
  },
  
  logout: async () => {
    await api.post('/auth/logout');
  },
  
  forgotPassword: async (data: ForgotPasswordFormValues) => {
    const response = await api.post('/auth/password/reset', data);
    return response.data.data;
  },
  
  resetPassword: async (data: any) => {
    // UI placeholder. Not supported for token-based unauthenticated resets in existing API.
    throw new Error("Password reset is only supported internally for authenticated users.");
  },
  
  refreshSession: async (refreshToken: string) => {
    // using base axios to avoid interceptor loop
    const axios = require('axios');
    const response = await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1') + '/auth/refresh', {
      refreshToken,
      sessionId: "client-session" // backend expects sessionId, but typically it should come from state or jwt
    });
    return response.data.data;
  },
  
  getCurrentUser: async () => {
    // Not supported by backend. User is pulled from local store.
    return null;
  },
};
`,

  // Interceptors
  'services/api/interceptors.ts': `
import { api } from './api';
import { useAuthStore } from '@/features/auth/store';
import { authService } from '@/features/auth/services';

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const result = await authService.refreshSession(refreshToken);
          useAuthStore.getState().setTokens(result.accessToken, result.refreshToken);
          originalRequest.headers.Authorization = \`Bearer \${result.accessToken}\`;
          return api(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') window.location.href = '/session-expired';
        }
      } else {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
`,

  // Provider
  'providers/AuthProvider.tsx': `
"use client";
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import '@/services/api/interceptors';

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
`,

  // Guards
  'features/auth/components/Guards.tsx': `
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
import { authService } from "../services";
import { useAuthStore } from "../store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await authService.login(data);
      // Backend returns { accessToken, refreshToken, user }
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      toast.success("Login successful");
      router.push('/dashboard');
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      <AuthErrorState message={errorMsg} />
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
import { AuthErrorState } from "../components/AuthStates";
import { useState } from "react";
import { authService } from "../services";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await authService.register(data);
    } catch (e: any) {
      setErrorMsg(e.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      <AuthErrorState message={errorMsg || "Self-registration is disabled. Please contact your administrator."} />
      <div>
        <TextInput label="Full Name" disabled {...register("name")} />
      </div>
      <div>
        <EmailInput disabled {...register("email")} />
      </div>
      <div>
        <PasswordInput disabled {...register("password")} />
      </div>
      <LoadingButton isLoading={isLoading} disabled type="submit">Create Account</LoadingButton>
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
import { AuthSuccessState, AuthErrorState } from "../components/AuthStates";
import { useState } from "react";
import { authService } from "../services";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsSuccess(false);
    try {
      await authService.forgotPassword(data);
      setIsSuccess(true);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || "Failed to initiate password reset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      {isSuccess && <AuthSuccessState message="Password reset link has been sent to your email." />}
      <AuthErrorState message={errorMsg} />
      <div>
        <EmailInput {...register("email")} />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <LoadingButton isLoading={isLoading} type="submit">Send Reset Link</LoadingButton>
    </AuthFormWrapper>
  );
}
`
};

Object.entries(files).forEach(([f, content]) => {
  const filePath = path.join(root, f);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trim() + '\\n');
});

console.log("Auth connection generated successfully");
