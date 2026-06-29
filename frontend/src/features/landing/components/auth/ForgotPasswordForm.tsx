"use client";

import React from "react";
import { AuthState } from "./AuthPanel";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function ForgotPasswordForm({ onSwitch }: { onSwitch: (state: AuthState) => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSwitch("otp");
  };

  return (
    <div className="flex flex-col w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-sm text-[#B7B7B7]">Enter your email to receive a verification code.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-[#B7B7B7] group-focus-within:text-[#D4AF37] transition-colors" />
          </div>
          <input
            type="email"
            required
            className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[#B7B7B7] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            placeholder="Email address"
          />
        </div>

        <MagneticButton variant="primary" type="submit" className="w-full py-3">
          Send Code <ArrowRight className="w-4 h-4 ml-2" />
        </MagneticButton>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => onSwitch("login")}
          className="inline-flex items-center text-sm text-[#B7B7B7] hover:text-[#F7D774] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
        </button>
      </div>
    </div>
  );
}
