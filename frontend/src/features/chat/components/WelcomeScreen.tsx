import React from 'react';
import { MessageSquarePlus, Sparkles, Database, FileText } from 'lucide-react';

export const WelcomeScreen: React.FC<{ onNewChat: () => void }> = ({ onNewChat }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
      <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-700/50">
        <Sparkles className="w-8 h-8 text-yellow-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Ask your AI Agent anything</h2>
      
      <div className="w-12 h-[1px] bg-zinc-700 my-6"></div>
      
      <p className="text-lg text-zinc-300 mb-8">What would you like to know today?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
        {[
          { icon: <Database className="w-5 h-5 text-zinc-400" />, text: 'Search through the company knowledge base' },
          { icon: <FileText className="w-5 h-5 text-zinc-400" />, text: 'Summarize the latest HR policies' },
          { icon: <MessageSquarePlus className="w-5 h-5 text-zinc-400" />, text: 'Draft an email based on guidelines' },
          { icon: <Sparkles className="w-5 h-5 text-zinc-400" />, text: 'Analyze the recent sales report' },
        ].map((item, idx) => (
          <button 
            key={idx}
            className="flex items-center gap-3 p-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all text-left group"
          >
            <div className="p-2 bg-zinc-800 group-hover:bg-zinc-700 rounded-lg transition-colors">
              {item.icon}
            </div>
            <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
              {item.text}
            </span>
          </button>
        ))}
      </div>

      <button 
        onClick={onNewChat}
        className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-medium transition-colors"
      >
        <MessageSquarePlus className="w-5 h-5" />
        Start New Conversation
      </button>
    </div>
  );
};
