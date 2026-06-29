import { AuthGuard } from '@/features/auth/components/Guards';
import { DashboardProvider } from '@/providers/DashboardProvider';
import { DashboardShell } from '@/components/dashboard/layout/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardProvider>
        <DashboardShell>
          {children}
        </DashboardShell>
      </DashboardProvider>
    </AuthGuard>
  );
}
