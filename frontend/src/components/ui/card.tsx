import React from 'react';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-lg border ${className || ''}`}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`p-6 pb-2 ${className || ''}`}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={`font-semibold tracking-tight ${className || ''}`}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={`text-sm ${className || ''}`}>{children}</p>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`p-6 pt-2 ${className || ''}`}>{children}</div>;
}
