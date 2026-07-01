"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../schemas";
import { AuthCard } from "../components/AuthCard";
import { EmailInput, PasswordInput, CheckboxInput } from "../components/AuthInputs";
import { LoadingButton, ForgotPasswordLink } from "../components/AuthButtons";
import { AuthErrorState } from "../components/AuthStates";
import { SocialLogin } from "../components/SocialLogin";
import { useState } from "react";
import { authService } from "../services";
import { useAuthStore } from "../store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(undefined);
    try {
      const response = await authService.login(data);
      if (response.requireMfa) {
        toast.info("MFA required - redirecting");
        router.push("/mfa");
        return;
      }
      setTokens(response.accessToken, response.refreshToken, response.sessionId);
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
    <AuthCard>
      <div className="mb-2">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-[#D4AF37] transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to website
        </Link>
      </div>
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white tracking-tight"
        >
          Welcome Back
        </motion.h1>
        <p className="text-zinc-400 mt-2 text-sm">Sign in to your Nexora AI workspace.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AuthErrorState message={errorMsg} />
        
        <div>
          <EmailInput {...register("email")} />
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
        </div>
        
        <div>
          <PasswordInput {...register("password")} />
          {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
          <ForgotPasswordLink />
        </div>
        
        <div>
          <CheckboxInput label="Remember me" {...register("rememberMe")} />
        </div>
        
        <LoadingButton isLoading={isLoading} type="submit">
          Sign In
        </LoadingButton>
      </form>

      <div className="mt-8">
        <SocialLogin />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-[#D4AF37] hover:text-[#F7D774] transition-colors">
            Create Workspace
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
