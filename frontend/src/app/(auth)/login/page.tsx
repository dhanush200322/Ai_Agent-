import { AuthPanel } from '@/features/landing/components/auth/AuthPanel';

export default function LoginPage() {
  return (
    <div className="w-full flex items-center justify-center">
      <AuthPanel initialState="login" />
    </div>
  );
}
