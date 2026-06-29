"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "../schemas";
import { AuthFormWrapper } from "../components/AuthFormWrapper";
import { EmailInput } from "../components/AuthInputs";
import { LoadingButton } from "../components/AuthButtons";
import { AuthSuccessState, AuthErrorState } from "../components/AuthStates";
import { useState } from "react";
import { authService } from "../services";

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
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      {isSuccess && <AuthSuccessState message="Password reset link has been sent to your email." />}
      <AuthErrorState message={errorMsg} />
      <div>
        <EmailInput {...register("email")} />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <LoadingButton isLoading={isLoading} type="submit">Send Reset Link</LoadingButton>
    </AuthFormWrapper>
  );
}
