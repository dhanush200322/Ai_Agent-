'use client';

import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils'; // assuming cn utility exists

export type AgentAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'conversation-list' | 'chat-sidebar' | 'chat-header' | 'chat-bubble' | 'public-widget' | 'widget-launcher' | 'dashboard-card' | 'agent-details';

interface AgentAvatarProps {
  imageUrl?: string | null;
  name?: string;
  size?: AgentAvatarSize;
  className?: string;
}

const sizeClasses: Record<AgentAvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
  'conversation-list': 'w-9 h-9 text-sm',
  'chat-bubble': 'w-9 h-9 text-sm',
  'chat-sidebar': 'w-10 h-10 text-base',
  'chat-header': 'w-12 h-12 text-lg',
  'public-widget': 'w-12 h-12 text-lg',
  'widget-launcher': 'w-14 h-14 text-xl',
  'dashboard-card': 'w-16 h-16 text-xl',
  'agent-details': 'w-[120px] h-[120px] text-4xl',
};

const getInitials = (name: string) => {
  if (!name) return 'AI';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  imageUrl,
  name = 'AI Agent',
  size = 'md',
  className
}) => {
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Reset error state if imageUrl changes
  useEffect(() => {
    setImgError(false);
    setRetryCount(0);
  }, [imageUrl]);

  const handleError = () => {
    if (retryCount < 1) {
      setRetryCount((prev) => prev + 1);
    } else {
      setImgError(true);
    }
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  // Clean up URL to prevent double slashes
  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${backendUrl}${url}`;
    return url;
  };

  const finalUrl = getFullUrl(imageUrl || '');

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
        currentSizeClass,
        className
      )}
    >
      {imageUrl && !imgError ? (
        <img
          src={finalUrl}
          alt={`${name} Avatar`}
          className="h-full w-full object-cover object-center aspect-square"
          onError={handleError}
          loading="lazy"
        />
      ) : name ? (
        <span className="font-semibold">{getInitials(name)}</span>
      ) : (
        <Bot className="h-1/2 w-1/2" />
      )}
    </div>
  );
};
