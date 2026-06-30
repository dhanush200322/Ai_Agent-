import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SourcePlaceholderProps {
  title: string;
  icon: LucideIcon;
}

export const SourcePlaceholder: React.FC<SourcePlaceholderProps> = ({ title, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 mb-6">
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
        <span className="text-sm font-medium">Backend API Required</span>
      </div>
      
      <div className="w-full max-w-md border-t border-zinc-800 my-4"></div>
      
      <p className="text-gray-400 text-center max-w-md">
        This knowledge source type requires specific backend ingestion, chunking, and crawling routes. 
        Once the backend exposes these APIs, this interface will automatically unlock.
      </p>
    </div>
  );
};
