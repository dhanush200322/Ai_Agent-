import React from 'react';
import { Database, Brain, Sparkles, Globe, Code } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { SourceCitationCard } from './SourceCitationCard';
import { DeployWidgetModal } from '../DeployWidgetModal';

export const ContextPanel: React.FC = () => {
  const { streamingSources, activeConversation, selectedAgent } = useChatStore();
  const [isDeployModalOpen, setIsDeployModalOpen] = React.useState(false);

  return (
    <div className="w-80 h-full bg-zinc-950 border-l border-zinc-800 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-yellow-500" />
          Knowledge Context
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Deploy Agent Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-3 h-3" />
            Integration
          </h4>
          
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
            <div className="text-xs text-zinc-400">
              Deploy this agent directly to your website.
            </div>
            
            <button 
              onClick={() => setIsDeployModalOpen(true)}
              className="relative w-full group overflow-hidden rounded-lg p-[1.5px]"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_0%,#00000000_50%,#D4AF37_100%)]" />
              <div className="relative w-full h-full py-2.5 bg-zinc-950 group-hover:bg-zinc-900 text-[#D4AF37] font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors backdrop-blur-xl">
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                Deploy Agent in your Own Website
              </div>
            </button>
          </div>
        </div>
      </div>

      <DeployWidgetModal 
        isOpen={isDeployModalOpen} 
        onClose={() => setIsDeployModalOpen(false)} 
        agent={selectedAgent}
      />
    </div>
  );
};
