"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "../schemas";
import { AuthCard } from "../components/AuthCard";
import { EmailInput } from "../components/AuthInputs";
import { LoadingButton, BackToLoginButton } from "../components/AuthButtons";
import { AuthSuccessState, AuthErrorState } from "../components/AuthStates";
import { useState } from "react";
import { authService } from "../services";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setErrorMsg(undefined);
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
    <AuthCard>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white tracking-tight"
        >
          Reset Password
        </motion.h1>
        <p className="text-zinc-400 mt-2 text-sm max-w-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {isSuccess && <AuthSuccessState message="Password reset link has been sent to your email." />}
        <AuthErrorState message={errorMsg} />
        
        <div>
          <EmailInput {...register("email")} />
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
        </div>
        
        <LoadingButton isLoading={isLoading} type="submit">
          Send Reset Link
        </LoadingButton>
      </form>

      <BackToLoginButton />
    </AuthCard>
  );
}
