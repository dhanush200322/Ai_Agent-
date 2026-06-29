"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "../schemas";
import { AuthFormWrapper } from "../components/AuthFormWrapper";
import { EmailInput, PasswordInput, TextInput } from "../components/AuthInputs";
import { LoadingButton } from "../components/AuthButtons";
import { AuthErrorState } from "../components/AuthStates";
import { useState } from "react";
import { authService } from "../services";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await authService.register(data);
    } catch (e: any) {
      setErrorMsg(e.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper onSubmit={handleSubmit(onSubmit)}>
      <AuthErrorState message={errorMsg || "Self-registration is disabled. Please contact your administrator."} />
      <div>
        <TextInput label="Full Name" disabled {...register("name")} />
      </div>
      <div>
        <EmailInput disabled {...register("email")} />
      </div>
      <div>
        <PasswordInput disabled {...register("password")} />
      </div>
      <LoadingButton isLoading={isLoading} disabled type="submit">Create Account</LoadingButton>
    </AuthFormWrapper>
  );
}
