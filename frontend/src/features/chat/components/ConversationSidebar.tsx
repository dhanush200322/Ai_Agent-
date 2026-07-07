import React, { useEffect, useState } from 'react';
import { Search, Plus, MessageSquare, Archive, Pin, Trash2, Settings, ChevronDown, Clock, SearchIcon } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { chatService } from '../services/chat.service';
import { agentService } from '@/features/agents/services/agent.service';
import { Agent, Conversation } from '../types/chat';
import { AgentAvatar } from '@/components/common/AgentAvatar';

export const ConversationSidebar: React.FC<{ 
  onSelect: (conv: Conversation) => void;
  onNewChat: () => void;
}> = ({ onSelect, onNewChat }) => {
  const { conversations, setConversations, activeConversation, selectedAgent, setSelectedAgent } = useChatStore();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState('');
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await agentService.getAgents(1, 50);
        setAgents(res.items as unknown as Agent[]); // type cast to Agent
        if (res.items.length > 0 && !selectedAgent) {
          setSelectedAgent(res.items[0] as unknown as Agent);
        }
      } catch (err) {
        console.error('Failed to load agents', err);
      }
    };
    fetchAgents();
  }, [selectedAgent, setSelectedAgent]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await chatService.listConversations(0, 50, selectedAgent?.id);
        setConversations(res.items);
      } catch (err) {
        console.error('Failed to load conversations', err);
      }
    };
    if (selectedAgent) fetchConversations();
  }, [selectedAgent, setConversations]);

  const filteredConversations = conversations.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase()) || 
    c.summary?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-zinc-800 space-y-4">
        {/* Agent Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AgentAvatar
                imageUrl={selectedAgent?.avatar}
                name={selectedAgent?.name || 'A'}
                size="chat-sidebar"
                updatedAt={selectedAgent?.updatedAt}
              />
              <div className="text-left">
                <p className="text-sm font-medium text-white truncate max-w-[150px]">{selectedAgent?.name || 'Select Agent'}</p>
                <p className="text-xs text-zinc-500 truncate max-w-[150px]">{selectedAgent?.model || 'Model'}</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </button>
          
          {isAgentDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-2 max-h-60 overflow-y-auto">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent);
                    setIsAgentDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors ${selectedAgent?.id === agent.id ? 'bg-zinc-800/50' : ''}`}
                >
                  <AgentAvatar
                    imageUrl={agent.avatar}
                    name={agent.name}
                    size="xs"
                    className="w-6 h-6 shrink-0"
                    updatedAt={agent.updatedAt}
                  />
                  <div className="text-left">
                    <p className="text-sm text-white">{agent.name}</p>
                    <p className="text-xs text-zinc-500">{agent.model}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-yellow-500 text-black rounded-xl font-medium hover:bg-yellow-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-zinc-500">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full p-3 rounded-xl text-left transition-all group relative ${
                activeConversation?.id === conv.id 
                  ? 'bg-zinc-800 border-zinc-700' 
                  : 'bg-transparent hover:bg-zinc-900 border-transparent'
              } border`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white truncate pr-4">
                  {conv.title || 'New Conversation'}
                </span>
                <span className="text-[10px] text-zinc-500 shrink-0">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {conv.summary || 'Start chatting...'}
              </p>
              
              {/* Hover Actions */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-zinc-800 p-1 rounded-lg shadow-lg">
                <div className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors">
                  <Archive className="w-3 h-3" />
                </div>
                <div className="p-1 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Bottom Footer */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Clock className="w-3 h-3" />
          <span>History kept for 30 days</span>
        </div>
      </div>
    </div>
  );
};
