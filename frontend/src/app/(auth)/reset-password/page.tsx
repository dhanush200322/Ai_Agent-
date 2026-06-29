import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { BackToLoginButton } from '@/features/auth/components/AuthButtons';
import { ResetPasswordForm } from '@/features/auth/forms/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <AuthHeader title="Reset Password" description="Enter a new password for your account." />
      <ResetPasswordForm />
      <BackToLoginButton />
    </AuthCard>
  );
}
