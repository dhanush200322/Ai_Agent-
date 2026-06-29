"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormValues } from "../schemas";
import { AuthFormWrapper } from "../components/AuthFormWrapper";
import { PasswordInput } from "../components/AuthInputs";
import { LoadingButton } from "../components/AuthButtons";
import { AuthSuccessState } from "../components/AuthStates";
import { useState } from "react";

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      {isSuccess && <AuthSuccessState message="Your password has been successfully reset." />}
      <div>
        <PasswordInput placeholder="New Password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <PasswordInput placeholder="Confirm New Password" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <LoadingButton isLoading={isLoading} type="submit">Reset Password</LoadingButton>
    </AuthFormWrapper>
  );
}
