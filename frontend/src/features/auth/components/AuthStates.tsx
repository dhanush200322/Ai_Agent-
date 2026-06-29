export function AuthErrorState({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">{message}</div>;
}

export function AuthSuccessState({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="p-3 text-sm text-green-600 bg-green-500/10 rounded-md border border-green-500/20">{message}</div>;
}
