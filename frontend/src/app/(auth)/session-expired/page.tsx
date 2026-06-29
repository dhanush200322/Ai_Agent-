import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import Link from 'next/link';

export default function SessionExpiredPage() {
  return (
    <AuthCard>
      <AuthHeader title="Session Expired" description="Your session has expired. Please log in again to continue." />
      <div className="mt-4">
        <Link href="/login" className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Return to Login
        </Link>
      </div>
    </AuthCard>
  );
}
