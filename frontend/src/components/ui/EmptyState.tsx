import React from 'react';
import { LucideIcon } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => (
  <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl bg-[rgba(255,255,255,0.01)]">
    <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center mb-6">
      <Icon className="w-8 h-8 text-[#D4AF37]" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 max-w-md mb-6">
      {description}
    </p>
    {actionLabel && onAction && (
      <MagneticButton onClick={onAction} variant="primary" className="px-6 py-2.5">
        {actionLabel}
      </MagneticButton>
    )}
  </div>
);
