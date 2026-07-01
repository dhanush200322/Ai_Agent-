"use client";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthSuccessState, AuthErrorState } from "@/features/auth/components/AuthStates";
import { BackToLoginButton } from "@/features/auth/components/AuthButtons";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/services/api/api";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Invalid or missing verification token.");
      return;
    }

    const verify = async () => {
      try {
        await api.post("/auth/verify-email", { token });
        setStatus("success");
      } catch (e: any) {
        setStatus("error");
        setErrorMsg(e.response?.data?.message || "Failed to verify email. The link may have expired.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="w-full">
      <AuthCard>
        <div className="mb-6 flex flex-col items-center text-center">
          {status === "loading" && (
            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          )}
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            {status === "loading" && "Verifying Email"}
            {status === "success" && "Email Verified"}
            {status === "error" && "Verification Failed"}
          </motion.h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-sm">
            {status === "loading" && "Please wait while we verify your email address..."}
            {status === "success" && "Your email has been successfully verified. You can now access all features of your workspace."}
            {status === "error" && "We couldn't verify your email address. Please try requesting a new verification link."}
          </p>
        </div>

        {status === "error" && <AuthErrorState message={errorMsg} />}
        {status === "success" && <AuthSuccessState message="You can now sign in to your account." />}

        <div className="mt-8">
          <BackToLoginButton />
        </div>
      </AuthCard>
    </div>
  );
}
