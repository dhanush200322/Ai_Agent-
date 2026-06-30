import React, { useState, useEffect } from 'react';
import { X, Loader2, Database, Search } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useKnowledgeBases } from '@/features/knowledge/hooks/useKnowledge';
import { useAgentKnowledgeBases, useAttachKnowledgeBases, useDetachKnowledgeBase } from '../hooks/useAgentKnowledge';
import { toast } from 'sonner';

interface AttachKnowledgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
}

export const AttachKnowledgeDialog: React.FC<AttachKnowledgeDialogProps> = ({ isOpen, onClose, agentId }) => {
  const [search, setSearch] = useState('');
  const { data: allKnowledgeBases, isLoading: isLoadingAll } = useKnowledgeBases(1, 100, search);
  const { data: attachedKnowledgeBases, isLoading: isLoadingAttached } = useAgentKnowledgeBases(agentId);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [initialSelectedIds, setInitialSelectedIds] = useState<Set<string>>(new Set());

  const { mutateAsync: attachKbs, isPending: isAttaching } = useAttachKnowledgeBases(agentId);
  const { mutateAsync: detachKb, isPending: isDetaching } = useDetachKnowledgeBase(agentId);

  const isPending = isAttaching || isDetaching;

  useEffect(() => {
    if (attachedKnowledgeBases) {
      const ids = new Set(attachedKnowledgeBases.map((kb: any) => kb.id));
      setSelectedIds(ids);
      setInitialSelectedIds(ids);
    }
  }, [attachedKnowledgeBases, isOpen]);

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
        await attachKbs(toAttach);
      }

      for (const id of toDetach) {
        await detachKb(id);
      }

      toast.success('Knowledge Bases updated successfully');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update Knowledge Bases');
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
            <div className="w-10 h-10 rounded-lg bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center">
              <Database className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-bold text-white">Attach Knowledge Bases</h2>
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
              placeholder="Search knowledge bases..."
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
          ) : allKnowledgeBases?.items.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No Knowledge Bases found.
            </div>
          ) : (
            <div className="space-y-1">
              {allKnowledgeBases?.items.map((kb) => (
                <label 
                  key={kb.id} 
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedIds.has(kb.id) ? 'bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)]' : 'hover:bg-[rgba(255,255,255,0.02)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-600 text-[#D4AF37] focus:ring-[#D4AF37] bg-transparent"
                      checked={selectedIds.has(kb.id)}
                      onChange={() => handleToggle(kb.id)}
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <span className="block text-sm font-medium text-white">{kb.name}</span>
                    {kb.description && (
                      <span className="block text-xs text-gray-500 truncate mt-0.5">{kb.description}</span>
                    )}
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
