"use client";
import { useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { api } from "@/services/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, setUser } = useAuthStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const sessionId = searchParams.get("sessionId");
    const provider = searchParams.get("provider");

    if (accessToken && refreshToken && sessionId) {
      hasRun.current = true;
      const completeLogin = async () => {
        setTokens(accessToken, refreshToken, sessionId);
        
        try {
          // Fetch user profile securely using the new token
          const userResponse = await api.get("/auth/me");
          setUser(userResponse.data.data);
          
          const providerName = provider === 'github' ? 'GitHub' : 'Google';
          toast.success(`Successfully logged in with ${providerName}`);
          router.push("/dashboard");
        } catch (e) {
          toast.error("Failed to complete login");
          router.push("/login?error=oauth_failed");
        }
      };

      completeLogin();
    } else if (searchParams.has("error")) {
        router.push("/login?error=oauth_failed");
    }
  }, [searchParams, router, setTokens, setUser]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      <p className="text-zinc-400 font-medium animate-pulse">Completing secure authentication...</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Suspense fallback={<Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />}>
        <OAuthCallbackHandler />
      </Suspense>
    </div>
  );
}
