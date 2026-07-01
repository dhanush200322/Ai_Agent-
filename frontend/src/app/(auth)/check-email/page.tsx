"use client";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { BackToLoginButton } from "@/features/auth/components/AuthButtons";
import { Mailbox } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckEmailPage() {
  return (
    <div className="w-full">
      <AuthCard>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6">
            <Mailbox className="w-8 h-8 text-[#D4AF37]" />
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            Check your email
          </motion.h1>
          <p className="text-zinc-400 mt-4 text-sm max-w-sm">
            We've sent a verification link to your email address. Please click the link to verify your account and continue.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center">
          <p className="text-xs text-zinc-500 mb-4">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
          <BackToLoginButton />
        </div>
      </AuthCard>
    </div>
  );
}
