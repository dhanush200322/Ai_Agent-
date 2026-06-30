import React, { useState, useEffect } from 'react';
import { X, Loader2, Bot, Search } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useAgents } from '@/features/agents/hooks/useAgents';
import { useKnowledgeAgents, useAttachAgents, useDetachAgent } from '../hooks/useKnowledgeAgents';
import { toast } from 'sonner';

interface ConnectAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeBaseId: string;
}

export const ConnectAgentDialog: React.FC<ConnectAgentDialogProps> = ({ isOpen, onClose, knowledgeBaseId }) => {
  const [search, setSearch] = useState('');
  const { data: allAgents, isLoading: isLoadingAll } = useAgents(1, 100, search);
  const { data: attachedAgents, isLoading: isLoadingAttached } = useKnowledgeAgents(knowledgeBaseId);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [initialSelectedIds, setInitialSelectedIds] = useState<Set<string>>(new Set());

  const { mutateAsync: attachAgents, isPending: isAttaching } = useAttachAgents(knowledgeBaseId);
  const { mutateAsync: detachAgent, isPending: isDetaching } = useDetachAgent(knowledgeBaseId);

  const isPending = isAttaching || isDetaching;

  useEffect(() => {
    if (attachedAgents) {
      const ids = new Set(attachedAgents.map((agent: any) => agent.id));
      setSelectedIds(ids);
      setInitialSelectedIds(ids);
    }
  }, [attachedAgents, isOpen]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSave = async () => {
    try {
      const toAttach = Array.from(selectedIds).filter(id => !initialSelectedIds.has(id));
      const toDetach = Array.from(initialSelectedIds).filter(id => !selectedIds.has(id));

      if (toAttach.length > 0) {
        await attachAgents(toAttach);
      }

      for (const id of toDetach) {
        await detachAgent(id);
      }

      toast.success('Agent connections updated successfully');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update agent connections');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Connect Agents</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 border-b border-[rgba(255,255,255,0.05)]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-[rgba(255,255,255,0.1)] rounded-lg bg-[rgba(255,255,255,0.02)] text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors text-sm"
            />
          </div>
        </div>

        <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
          {isLoadingAll || isLoadingAttached ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
            </div>
          ) : allAgents?.items.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No Agents found.
            </div>
          ) : (
            <div className="space-y-1">
              {allAgents?.items.map((agent) => (
                <label 
                  key={agent.id} 
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedIds.has(agent.id) ? 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]' : 'hover:bg-[rgba(255,255,255,0.02)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-600 text-white focus:ring-white bg-transparent"
                      checked={selectedIds.has(agent.id)}
                      onChange={() => handleToggle(agent.id)}
                    />
                  </div>
                  <div className="ml-3 flex-1 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-md bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden shrink-0">
                      {agent.avatar ? <img src={agent.avatar} className="w-full h-full object-cover" /> : <Bot className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-white">{agent.name}</span>
                      {agent.description && (
                        <span className="block text-xs text-gray-500 truncate mt-0.5">{agent.description}</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-5 border-t border-[rgba(255,255,255,0.05)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <MagneticButton onClick={handleSave} variant="primary" className="px-6 py-2.5" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isPending ? 'Saving...' : 'Save Selection'}
          </MagneticButton>
        </div>
      </div>
    </div>
  );
};
