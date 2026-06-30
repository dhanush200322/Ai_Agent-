import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderTabProps {
  name: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
}

export const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ 
  name, 
  icon: Icon,
  description = "This feature is backend ready but the frontend UI is a placeholder for future phases.",
  badge = "Phase 4+ Integration"
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl bg-[rgba(255,255,255,0.01)] mt-6">
    <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center mb-6">
      <Icon className="w-8 h-8 text-gray-500" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{name} (Coming Soon)</h3>
    <p className="text-gray-400 max-w-md mb-4">
      {description}
    </p>
    <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded text-xs">{badge}</span>
  </div>
);
