"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../schemas";
import { AuthFormWrapper } from "../components/AuthFormWrapper";
import { EmailInput, PasswordInput, CheckboxInput } from "../components/AuthInputs";
import { LoadingButton, ForgotPasswordLink } from "../components/AuthButtons";
import { AuthErrorState } from "../components/AuthStates";
import { useState } from "react";
import { authService } from "../services";
import { useAuthStore } from "../store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(undefined);
    try {
      const response = await authService.login(data);
      if (response.requireMfa) {
        toast.info("MFA required - redirecting");
        router.push("/mfa");
        return;
      }
      setTokens(response.accessToken, response.refreshToken, response.sessionId);
      setUser(response.user);
      toast.success("Login successful");
      router.push('/dashboard');
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      <AuthErrorState message={errorMsg} />
      <div>
        <EmailInput {...register("email")} />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <PasswordInput {...register("password")} />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        <ForgotPasswordLink />
      </div>
      <div>
        <CheckboxInput label="Remember me" {...register("rememberMe")} />
      </div>
      <LoadingButton isLoading={isLoading} type="submit">Sign In</LoadingButton>
    </AuthFormWrapper>
  );
}
