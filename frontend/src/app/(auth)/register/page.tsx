import { AuthPanel } from '@/features/landing/components/auth/AuthPanel';

export default function RegisterPage() {
  return (
    <div className="w-full flex items-center justify-center">
      <AuthPanel initialState="signup" />
    </div>
  );
}
