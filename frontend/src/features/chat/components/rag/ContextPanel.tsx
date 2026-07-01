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
        {/* Active Sources */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Retrieved Sources</h4>
          {streamingSources && streamingSources.length > 0 ? (
            <div className="space-y-2">
              {streamingSources.map((citation, idx) => (
                <SourceCitationCard key={idx} citation={citation} />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
              <p className="text-xs text-zinc-500">No sources retrieved for the last message.</p>
            </div>
          )}
        </div>

        {/* Chat Settings (Locked) */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Chat Settings
          </h4>
          
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 mb-2 w-full justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              <span className="text-[10px] font-medium uppercase tracking-wider">Backend API Required</span>
            </div>
            
            {[
              { label: 'Temperature', value: '0.7' },
              { label: 'Top P', value: '1.0' },
              { label: 'Max Tokens', value: '2048' },
            ].map((setting) => (
              <div key={setting.label} className="space-y-1 opacity-50">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>{setting.label}</span>
                  <span>{setting.value}</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-600" style={{ width: '50%' }}></div>
                </div>
              </div>
            ))}

            <div className="pt-2 space-y-2 opacity-50">
              {[
                { label: 'Reasoning Mode', active: false },
                { label: 'Streaming', active: true },
                { label: 'Memory', active: true },
              ].map((toggle) => (
                <div key={toggle.label} className="flex justify-between items-center text-xs text-zinc-400">
                  <span>{toggle.label}</span>
                  <div className={`w-8 h-4 rounded-full flex items-center px-1 ${toggle.active ? 'bg-zinc-600 justify-end' : 'bg-zinc-800 justify-start'}`}>
                    <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                  </div>
                </div>
              ))}
            </div>

            <button disabled className="w-full mt-2 py-2 bg-zinc-800 text-zinc-500 text-xs rounded-lg cursor-not-allowed">
              Prompt Preview
            </button>
          </div>
        </div>

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
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors border border-zinc-700"
            >
              <Code className="w-4 h-4 text-yellow-500" />
              Deploy Agent in your Own Website
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
