"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "../components/AuthCard";
import { TextInput } from "../components/AuthInputs";
import { LoadingButton, BackToLoginButton } from "../components/AuthButtons";
import { AuthErrorState } from "../components/AuthStates";
import { useState } from "react";
import { api } from "@/services/api/api";
import { useAuthStore } from "../store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const mfaSchema = z.object({
  token: z.string().length(6, "Code must be exactly 6 digits").regex(/^\d+$/, "Code must contain only numbers"),
});

type MFAFormValues = z.infer<typeof mfaSchema>;

export function MFAForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<MFAFormValues>({
    resolver: zodResolver(mfaSchema)
  });

  const onSubmit = async (data: MFAFormValues) => {
    setIsLoading(true);
    setErrorMsg(undefined);
    try {
      const response = await api.post('/auth/mfa/verify', { token: data.token });
      const { accessToken, refreshToken, user, sessionId } = response.data.data;
      
      setTokens(accessToken, refreshToken, sessionId);
      setUser(user);
      
      toast.success("Authentication successful");
      router.push('/dashboard');
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || "Invalid authentication code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white tracking-tight"
        >
          Two-Factor Authentication
        </motion.h1>
        <p className="text-zinc-400 mt-2 text-sm max-w-sm">
          {useRecoveryCode 
            ? "Enter one of your 8-character recovery codes." 
            : "Enter the 6-digit authentication code provided by your authenticator app."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AuthErrorState message={errorMsg} />
        
        <div>
          <TextInput 
            label={useRecoveryCode ? "Recovery Code" : "Authentication Code"} 
            placeholder={useRecoveryCode ? "e.g. A1B2C3D4" : "e.g. 123456"} 
            className="text-center text-2xl tracking-[0.5em] font-mono h-14"
            maxLength={useRecoveryCode ? 8 : 6}
            {...register("token")} 
          />
          {errors.token && <p className="text-xs text-red-400 mt-1.5 text-center">{errors.token.message}</p>}
        </div>
        
        <LoadingButton isLoading={isLoading} type="submit">
          Verify
        </LoadingButton>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={() => setUseRecoveryCode(!useRecoveryCode)} 
          className="text-sm font-medium text-zinc-400 hover:text-[#D4AF37] transition-colors"
        >
          {useRecoveryCode ? "Use Authenticator App Instead" : "Use Recovery Code"}
        </button>
      </div>

      <BackToLoginButton />
    </AuthCard>
  );
}
