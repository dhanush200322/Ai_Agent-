import React, { useState } from 'react';
import { useCreateSource } from '../hooks/useKnowledge';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Loader2, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  knowledgeBaseId: string;
}

export const ManualTextEntry: React.FC<Props> = ({ knowledgeBaseId }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const { mutateAsync: createSource, isPending } = useCreateSource(knowledgeBaseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    try {
      await createSource({
        type: 'text',
        data: {
          name,
          content
        }
      });
      toast.success('Text source ingested successfully');
      setName('');
      setContent('');
    } catch (err) {
      toast.error('Failed to ingest text source');
    }
  };

  return (
    <div className="bg-[#111111] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-500 group-hover:scale-110 pointer-events-none" />
      
      <div className="relative z-10 flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Manual Text Entry</h3>
          <p className="text-sm text-gray-400">Directly paste text, notes, or transcripts to ingest into the knowledge base.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Source Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
            placeholder="e.g., Q3 All Hands Transcript"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Content (Markdown supported)</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors resize-y"
            placeholder="# HR Policy\n\nAll employees must..."
          />
        </div>
        
        <div className="flex justify-end pt-2">
          <MagneticButton
            type="submit"
            disabled={isPending || !name.trim() || !content.trim()}
            variant="primary"
            className="px-6 py-2.5"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Ingest Source
          </MagneticButton>
        </div>
      </form>
    </div>
  );
};
