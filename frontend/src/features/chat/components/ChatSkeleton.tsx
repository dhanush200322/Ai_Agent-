import React from 'react';

export const ChatSkeleton: React.FC = () => {
  return (
    <div className="flex-1 p-6 space-y-6 animate-pulse">
      <div className="flex space-x-4">
        <div className="w-10 h-10 bg-zinc-800 rounded-full shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
        </div>
      </div>
      <div className="flex space-x-4 flex-row-reverse space-x-reverse">
        <div className="w-10 h-10 bg-zinc-800 rounded-full shrink-0"></div>
        <div className="flex-1 space-y-3 flex flex-col items-end">
          <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="w-10 h-10 bg-zinc-800 rounded-full shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
          <div className="h-20 bg-zinc-800 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
};
