"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "../schemas";
import { AuthCard } from "../components/AuthCard";
import { EmailInput, PasswordInput, TextInput, CheckboxInput } from "../components/AuthInputs";
import { AuthErrorState } from "../components/AuthStates";
import { SocialLogin } from "../components/SocialLogin";
import { useState } from "react";
import { authService } from "../services";
import { useAuthStore } from "../store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PasswordStrength } from "../components/PasswordStrength";

const slugify = (text: string) => text.toString().toLowerCase().trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-');

export function RegisterForm() {
  const [loadingStage, setLoadingStage] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormValues) => {
    setLoadingStage(1); // Creating Workspace...
    setErrorMsg(undefined);
    try {
      const payload = {
        organizationName: data.workspaceName,
        organizationSlug: slugify(data.workspaceName),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      };
      
      const response = await authService.register(payload);
      
      setLoadingStage(2); // Organization Created
      await new Promise(res => setTimeout(res, 800));
      
      setLoadingStage(3); // Owner Account Created
      await new Promise(res => setTimeout(res, 800));
      
      setTokens(response.tokens.accessToken, response.tokens.refreshToken, response.tokens.sessionId || '');
      setUser(response.user);
      
      setLoadingStage(4); // Redirecting
      await new Promise(res => setTimeout(res, 800));
      
      router.push('/dashboard');
    } catch (e: any) {
      setLoadingStage(0);
      setErrorMsg(e.response?.data?.error || e.response?.data?.message || e.message || "Registration failed");
    }
  };

  const renderSubmitButton = () => {
    if (loadingStage === 0) {
      return (
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-[#D4AF37] to-[#F7D774] hover:from-[#F7D774] hover:to-[#D4AF37] transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          Create Workspace
        </button>
      );
    }
    
    let text = "Creating Workspace...";
    if (loadingStage === 2) text = "✔ Organization Created";
    if (loadingStage === 3) text = "✔ Owner Account Created";
    if (loadingStage === 4) text = "Redirecting...";
    
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-[#D4AF37] to-[#F7D774] opacity-90 cursor-not-allowed transition-all"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </button>
    );
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
      <div className="mb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white tracking-tight"
        >
          Create your Workspace
        </motion.h1>
        <p className="text-zinc-400 mt-2 text-sm">Join Nexora AI and start building agents.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthErrorState message={errorMsg} />
        
        <div>
          <TextInput label="Workspace Name" placeholder="e.g. Acme Corp" {...register("workspaceName")} />
          {errors.workspaceName && <p className="text-xs text-red-400 mt-1.5">{errors.workspaceName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <TextInput label="First Name" placeholder="John" {...register("firstName")} />
            {errors.firstName && <p className="text-xs text-red-400 mt-1.5">{errors.firstName.message}</p>}
          </div>
          <div>
            <TextInput label="Last Name" placeholder="Doe" {...register("lastName")} />
            {errors.lastName && <p className="text-xs text-red-400 mt-1.5">{errors.lastName.message}</p>}
          </div>
        </div>
        
        <div>
          <EmailInput {...register("email")} />
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
        </div>
        
        <div>
          <PasswordInput {...register("password")} />
          {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
          {password && <PasswordStrength password={password} />}
        </div>

        <div>
          <PasswordInput label="Confirm Password" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5">{errors.confirmPassword.message}</p>}
        </div>
        
        <div className="pt-2">
          <CheckboxInput 
            label={
              <span>I agree to the <a href="#" className="text-[#D4AF37] hover:underline">Terms of Service</a> and <a href="#" className="text-[#D4AF37] hover:underline">Privacy Policy</a></span>
            } 
            {...register("acceptTerms")} 
          />
          {errors.acceptTerms && <p className="text-xs text-red-400 mt-1.5">{errors.acceptTerms.message}</p>}
        </div>
        
        <div className="pt-2">
          {renderSubmitButton()}
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#D4AF37] hover:text-[#F7D774] transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
