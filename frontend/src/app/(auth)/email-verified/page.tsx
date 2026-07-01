"use client";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { BackToLoginButton } from "@/features/auth/components/AuthButtons";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function EmailVerifiedPage() {
  return (
    <div className="w-full">
      <AuthCard>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            Email Verified!
          </motion.h1>
          <p className="text-zinc-400 mt-4 text-sm max-w-sm">
            Thank you for verifying your email address. Your account is now fully active.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center">
          <BackToLoginButton />
        </div>
      </AuthCard>
    </div>
  );
}
