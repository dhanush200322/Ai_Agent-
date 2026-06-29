import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { BackToLoginButton } from '@/features/auth/components/AuthButtons';

export default function VerifyEmailPage() {
  return (
    <AuthCard>
      <AuthHeader title="Verify Email" description="Please check your inbox and verify your email address." />
      <div className="flex justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">We've sent a verification link to your email address. Click the link to verify your account.</p>
      </div>
      <BackToLoginButton />
    </AuthCard>
  );
}
