import React from 'react';
import { Fingerprint, Database, Cloud, Mail, CreditCard, Hash } from 'lucide-react';

export function CategoryBadge({ category }: { category: string }) {
  const c = category.toUpperCase();
  if (c.includes('AI')) return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium"><Fingerprint className="w-3 h-3" /> AI</span>;
  if (c.includes('DB') || c.includes('DATABASE')) return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium"><Database className="w-3 h-3" /> Database</span>;
  if (c.includes('CLOUD')) return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium"><Cloud className="w-3 h-3" /> Cloud</span>;
  if (c.includes('EMAIL') || c.includes('SMTP')) return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium"><Mail className="w-3 h-3" /> Email</span>;
  if (c.includes('PAYMENT') || c.includes('STRIPE')) return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium"><CreditCard className="w-3 h-3" /> Payment</span>;
  
  return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs font-medium"><Hash className="w-3 h-3" /> {category}</span>;
}
