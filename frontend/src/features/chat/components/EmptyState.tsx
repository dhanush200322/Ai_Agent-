import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

export const EmptyState: React.FC<{ onNewChat: () => void }> = ({ onNewChat }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800">
        <MessageSquarePlus className="w-8 h-8 text-zinc-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No conversation selected</h3>
      <p className="text-zinc-400 mb-6 max-w-sm">
        Choose a conversation from the sidebar or start a new chat with an AI Agent.
      </p>
      <button 
        onClick={onNewChat}
        className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl font-medium transition-colors"
      >
        Start New Chat
      </button>
    </div>
  );
};
