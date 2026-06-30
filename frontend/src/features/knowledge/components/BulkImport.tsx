import React, { useState } from 'react';
import { useCreateSource } from '../hooks/useKnowledge';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Loader2, HardDrive, Check, FileUp } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  knowledgeBaseId: string;
}

export const BulkImport: React.FC<Props> = ({ knowledgeBaseId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const { mutateAsync: createSource, isPending } = useCreateSource(knowledgeBaseId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setName(e.target.files[0].name);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    
    // Simple CSV parser assuming first line is header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const qIndex = headers.indexOf('question');
    const aIndex = headers.indexOf('answer');
    
    if (qIndex !== -1 && aIndex !== -1) {
      // It's a FAQ CSV
      const faqs = [];
      for (let i = 1; i < lines.length; i++) {
        // Very basic split (doesn't handle commas in quotes well, but good enough for MVP)
        const parts = lines[i].split(',');
        if (parts.length >= 2) {
          faqs.push({
            question: parts[qIndex],
            answer: parts[aIndex],
            category: 'Bulk Import',
            tags: []
          });
        }
      }
      return { type: 'faq', data: { name, questions: faqs } };
    }
    
    // If not FAQ, treat as raw text
    return { type: 'text', data: { name, content: text } };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      const text = await file.text();
      let payload;

      if (file.name.endsWith('.json')) {
        const json = JSON.parse(text);
        if (Array.isArray(json) && json[0]?.question && json[0]?.answer) {
          payload = { type: 'faq', data: { name, questions: json } };
        } else {
          payload = { type: 'text', data: { name, content: JSON.stringify(json, null, 2) } };
        }
      } else if (file.name.endsWith('.csv')) {
        payload = parseCSV(text);
      } else {
        toast.error('Only CSV and JSON files are currently supported for client-side bulk import.');
        return;
      }

      await createSource(payload);
      toast.success('Bulk import successful');
      setFile(null);
      setName('');
    } catch (err) {
      toast.error('Failed to process bulk import. Check file format.');
    }
  };

  return (
    <div className="bg-[#111111] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-500 group-hover:scale-110 pointer-events-none" />
      
      <div className="relative z-10 flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
          <HardDrive className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Bulk Import</h3>
          <p className="text-sm text-gray-400">Upload CSV or JSON files. If a CSV has 'question' and 'answer' headers, it will be imported as FAQs.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Import File</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-xl cursor-pointer bg-[#1A1A1A] hover:bg-[#222222] transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-400">
                  <span className="font-semibold text-[#D4AF37]">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">CSV or JSON (MAX. 5MB)</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".csv,.json"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {file && (
            <p className="mt-2 text-sm text-[#D4AF37]">Selected: {file.name}</p>
          )}
        </div>
        
        <div className="flex justify-end pt-2">
          <MagneticButton
            type="submit"
            disabled={isPending || !file}
            variant="primary"
            className="px-6 py-2.5"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Process Import
          </MagneticButton>
        </div>
      </form>
    </div>
  );
};
