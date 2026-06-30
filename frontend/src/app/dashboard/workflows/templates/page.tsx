'use client';

import React from 'react';
import { useWorkflowTemplates, useCreateWorkflow } from '@/features/workflows/hooks/useWorkflows';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { FileText, Plus, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
  const { data: templates = [], isLoading } = useWorkflowTemplates();
  const createMutation = useCreateWorkflow();
  const router = useRouter();

  const handleClone = async (template: any) => {
    try {
      const result = await createMutation.mutateAsync({
        name: `${template.name} (Clone)`,
        slug: `${template.slug}-clone-${Date.now()}`,
        description: template.description
      });
      // The template clone API logic might differ depending on backend, 
      // but assuming the create creates an empty one, then we would update it with template nodes.
      // If the backend has a /clone endpoint, it's used on existing workflows, not templates.
      // So this is just a mockup for creating from template.
      router.push(`/dashboard/workflows/builder/${result.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ContentWrapper>
      <PageHeader 
        title="Workflow Templates"
        description="Jumpstart your automation with pre-built enterprise templates."
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="text-center text-zinc-500 py-12">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-zinc-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Templates Available</h3>
            <p className="text-zinc-500 max-w-sm">
              Your organization currently doesn't have any workflow templates available. Create a new workflow from scratch instead.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tpl: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={tpl.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 group hover:border-zinc-700 transition-colors flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-zinc-400" />
                  </div>
                  <span className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[10px] uppercase font-semibold text-zinc-500">
                    {tpl.category || 'General'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-white mb-2">{tpl.name}</h3>
                <p className="text-sm text-zinc-500 mb-6 flex-1">{tpl.description}</p>
                
                <button 
                  onClick={() => handleClone(tpl)}
                  disabled={createMutation.isPending}
                  className="w-full py-2.5 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Use Template
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}
