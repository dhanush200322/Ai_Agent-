import React, { useState } from 'react';
import { useCreateSource } from '../hooks/useKnowledge';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Loader2, Layers, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  knowledgeBaseId: string;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export const FaqBuilder: React.FC<Props> = ({ knowledgeBaseId }) => {
  const [name, setName] = useState('');
  const [faqs, setFaqs] = useState<FAQItem[]>([{ question: '', answer: '', category: 'General', tags: [] }]);
  const { mutateAsync: createSource, isPending } = useCreateSource(knowledgeBaseId);

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '', category: 'General', tags: [] }]);
  };

  const handleRemoveFaq = (index: number) => {
    if (faqs.length <= 1) return;
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof FAQItem, value: any) => {
    const newFaqs = [...faqs];
    if (field === 'tags') {
      newFaqs[index][field] = value.split(',').map((t: string) => t.trim()).filter(Boolean);
    } else {
      newFaqs[index][field] = value;
    }
    setFaqs(newFaqs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Validate
    const validFaqs = faqs.filter(f => f.question.trim() && f.answer.trim());
    if (validFaqs.length === 0) {
      toast.error('Please provide at least one valid Q&A pair');
      return;
    }

    try {
      await createSource({
        type: 'faq',
        data: {
          name,
          questions: validFaqs
        }
      });
      toast.success('FAQ ingested successfully');
      setName('');
      setFaqs([{ question: '', answer: '', category: 'General', tags: [] }]);
    } catch (err) {
      toast.error('Failed to ingest FAQ');
    }
  };

  return (
    <div className="bg-[#111111] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-500 group-hover:scale-110 pointer-events-none" />
      
      <div className="relative z-10 flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
          <Layers className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">FAQ Builder</h3>
          <p className="text-sm text-gray-400">Create structured Question & Answer pairs for optimal chunking and retrieval.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">FAQ Collection Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
            placeholder="e.g., General Customer Support FAQs"
          />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 bg-[#1A1A1A] border border-[rgba(255,255,255,0.05)] rounded-xl relative group/item">
              <button
                type="button"
                onClick={() => handleRemoveFaq(index)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
                    <input
                      type="text"
                      required
                      value={faq.question}
                      onChange={(e) => handleChange(index, 'question', e.target.value)}
                      className="w-full bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g., What is your refund policy?"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                      <input
                        type="text"
                        value={faq.category}
                        onChange={(e) => handleChange(index, 'category', e.target.value)}
                        className="w-full bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                        placeholder="e.g., Billing"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={faq.tags.join(', ')}
                        onChange={(e) => handleChange(index, 'tags', e.target.value)}
                        className="w-full bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                        placeholder="refund, policy"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Answer</label>
                  <textarea
                    required
                    value={faq.answer}
                    onChange={(e) => handleChange(index, 'answer', e.target.value)}
                    rows={4}
                    className="w-full h-[calc(100%-20px)] bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] resize-none"
                    placeholder="Provide a detailed answer here..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={handleAddFaq}
            className="flex items-center text-sm text-[#D4AF37] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Another Q&A
          </button>
          
          <MagneticButton
            type="submit"
            disabled={isPending || !name.trim()}
            variant="primary"
            className="px-6 py-2.5"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Ingest FAQ
          </MagneticButton>
        </div>
      </form>
    </div>
  );
};
