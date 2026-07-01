"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormValues } from "../schemas";
import { AuthCard } from "../components/AuthCard";
import { PasswordInput } from "../components/AuthInputs";
import { LoadingButton, BackToLoginButton } from "../components/AuthButtons";
import { AuthSuccessState, AuthErrorState } from "../components/AuthStates";
import { useState } from "react";
import { authService } from "../services";
import { motion } from "framer-motion";
import { LockKeyhole } from "lucide-react";
import { PasswordStrength } from "../components/PasswordStrength";
import { useRouter } from "next/navigation";

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setErrorMsg(undefined);
    try {
      await authService.resetPassword(data);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (e: any) {
      setErrorMsg(e.message || e.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4">
          <LockKeyhole className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white tracking-tight"
        >
          Create New Password
        </motion.h1>
        <p className="text-zinc-400 mt-2 text-sm max-w-sm">
          Please enter your new password below to regain access to your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {isSuccess && <AuthSuccessState message="Your password has been successfully reset. Redirecting to login..." />}
        <AuthErrorState message={errorMsg} />
        
        <div>
          <PasswordInput label="New Password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
          {password && <PasswordStrength password={password} />}
        </div>
        
        <div>
          <PasswordInput label="Confirm New Password" placeholder="••••••••" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5">{errors.confirmPassword.message}</p>}
        </div>
        
        <LoadingButton isLoading={isLoading} type="submit">
          Reset Password
        </LoadingButton>
      </form>

      <BackToLoginButton />
    </AuthCard>
  );
}
