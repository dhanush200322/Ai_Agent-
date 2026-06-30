import React from 'react';
import { Settings, Share, MoreVertical, Shield } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

export const ConversationHeader: React.FC = () => {
  const { activeConversation, selectedAgent } = useChatStore();

  if (!activeConversation) return null;

  return (
    <div className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            {activeConversation.title || 'New Conversation'}
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-medium">
              Enterprise
            </span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-500" />
              {selectedAgent?.name || 'Agent'}
            </span>
            <span>•</span>
            <span>{selectedAgent?.model || 'Model'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <Share className="w-5 h-5" />
        </button>
        <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
