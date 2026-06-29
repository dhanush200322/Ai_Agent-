import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { BackToLoginButton } from '@/features/auth/components/AuthButtons';
import { ForgotPasswordForm } from '@/features/auth/forms/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <AuthHeader title="Forgot Password" description="Enter your email to receive a reset link." />
      <ForgotPasswordForm />
      <BackToLoginButton />
    </AuthCard>
  );
}
