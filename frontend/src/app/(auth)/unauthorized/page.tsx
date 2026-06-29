import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { BackToLoginButton } from '@/features/auth/components/AuthButtons';

export default function UnauthorizedPage() {
  return (
    <AuthCard>
      <AuthHeader title="Access Denied" description="You do not have permission to view this page." />
      <BackToLoginButton />
    </AuthCard>
  );
}
