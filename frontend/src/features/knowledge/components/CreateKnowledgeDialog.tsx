import React, { useState } from 'react';
import { X, Loader2, Database } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useCreateKnowledgeBase } from '../hooks/useKnowledge';
import { toast } from 'sonner';

interface CreateKnowledgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

export const CreateKnowledgeDialog: React.FC<CreateKnowledgeDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const { mutateAsync: createKB, isPending } = useCreateKnowledgeBase();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Knowledge Base name is required');
      return;
    }

    try {
      const result = await createKB({ name, description });
      toast.success('Knowledge Base created successfully');
      onSuccess(result.id);
      onClose();
      // Reset form
      setName('');
      setDescription('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create Knowledge Base');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center">
              <Database className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-bold text-white">New Knowledge Base</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Employee Handbook"
                className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg py-2.5 px-4 text-white placeholder-gray-600 focus:border-[#D4AF37] focus:outline-none transition-colors"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What kind of documents will this contain?"
                rows={3}
                className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg py-2.5 px-4 text-white placeholder-gray-600 focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <MagneticButton type="submit" variant="primary" className="px-6 py-2.5" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isPending ? 'Creating...' : 'Create Knowledge Base'}
            </MagneticButton>
          </div>
        </form>
      </div>
    </div>
  );
};
