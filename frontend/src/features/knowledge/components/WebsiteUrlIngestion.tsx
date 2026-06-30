import React, { useState } from 'react';
import { useCreateSource } from '../hooks/useKnowledge';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Loader2, Globe, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  knowledgeBaseId: string;
}

export const WebsiteUrlIngestion: React.FC<Props> = ({ knowledgeBaseId }) => {
  const [url, setUrl] = useState('');
  const { mutateAsync: createSource, isPending } = useCreateSource(knowledgeBaseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      new URL(url); // Basic validation
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      await createSource({
        type: 'website',
        data: { url }
      });
      toast.success('Website URL queued for ingestion');
      setUrl('');
    } catch (err) {
      toast.error('Failed to ingest URL');
    }
  };

  return (
    <div className="bg-[#111111] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 relative overflow-hidden group max-w-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-500 group-hover:scale-110 pointer-events-none" />
      
      <div className="relative z-10 flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
          <Globe className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Website URL Ingestion</h3>
          <p className="text-sm text-gray-400">Enter a public URL. The system will fetch and extract text content from the page.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Page URL</label>
          <div className="flex gap-3">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
              placeholder="https://example.com/docs"
            />
            <MagneticButton
              type="submit"
              disabled={isPending || !url.trim()}
              variant="primary"
              className="px-6"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Ingest
            </MagneticButton>
          </div>
        </div>
      </form>
    </div>
  );
};
