export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
      {children}
    </div>
  );
}
