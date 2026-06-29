"use client";

import React, { useState, useEffect } from "react";
import { AuthState } from "./AuthPanel";
import { ArrowLeft, ShieldAlert, ArrowRight, Loader2, User as UserIcon, Lock } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { api } from "@/services/api/api";
import { toast } from "sonner";
import { Suspense } from "react";

const acceptInviteSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must be at least 8 characters, contain an uppercase letter, lowercase letter, a number, and a special character"),
});

type AcceptInviteValues = z.infer<typeof acceptInviteSchema>;

function SignupFormContent({ onSwitch }: { onSwitch: (state: AuthState) => void }) {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
  });

  const onSubmit = async (data: AcceptInviteValues) => {
    if (!token) return;
    try {
      setIsLoading(true);
      await api.post('/users/accept-invite', {
        token,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password
      });
      toast.success("Account created successfully! Please login.");
      onSwitch("login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept invite");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col w-full items-center justify-center text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center mb-6">
            <ShieldAlert className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Registration Disabled</h2>
          <p className="text-[#B7B7B7] max-w-sm leading-relaxed">
            Account creation is managed by your organization. Please contact your administrator to provision an Enterprise AI Agent account.
          </p>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => onSwitch("login")} 
            className="flex items-center text-sm text-[#D4AF37] font-medium hover:text-[#F7D774] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Complete Registration</h2>
        <p className="text-sm text-[#B7B7B7]">Set up your account details to join.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
        <div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-[#B7B7B7]" />
            </div>
            <input
              {...register("firstName")}
              type="text"
              className={`w-full bg-[rgba(255,255,255,0.02)] border ${errors.firstName ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4AF37]`}
              placeholder="First Name"
            />
          </div>
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>

        <div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-[#B7B7B7]" />
            </div>
            <input
              {...register("lastName")}
              type="text"
              className={`w-full bg-[rgba(255,255,255,0.02)] border ${errors.lastName ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4AF37]`}
              placeholder="Last Name"
            />
          </div>
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </div>

        <div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-[#B7B7B7]" />
            </div>
            <input
              {...register("password")}
              type="password"
              className={`w-full bg-[rgba(255,255,255,0.02)] border ${errors.password ? 'border-red-500' : 'border-[rgba(255,255,255,0.1)]'} rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4AF37]`}
              placeholder="Password"
            />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="pt-2">
          <MagneticButton variant="primary" className="w-full py-3">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <>Complete <ArrowRight className="w-4 h-4 ml-2" /></>}
          </MagneticButton>
        </div>
      </form>
    </div>
  );
}

export function SignupForm({ onSwitch }: { onSwitch: (state: AuthState) => void }) {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-[#D4AF37]" /></div>}>
      <SignupFormContent onSwitch={onSwitch} />
    </Suspense>
  );
}
