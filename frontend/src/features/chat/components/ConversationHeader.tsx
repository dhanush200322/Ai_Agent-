import React from 'react';
import { Settings, Share, MoreVertical, Shield } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

export const ConversationHeader: React.FC = () => {
  const { activeConversation, selectedAgent, isMobileSidebarOpen, setMobileSidebarOpen, isContextPanelOpen, setContextPanelOpen } = useChatStore();

  if (!activeConversation) return null;

  return (
    <div className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg md:hidden"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
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
        <button 
          onClick={() => setContextPanelOpen(!isContextPanelOpen)}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors lg:hidden"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
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
