'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';

export default function WorkflowTemplatesDashboard() {
  return (
    <ContentWrapper>
      <PageHeader 
        title="Workflow Templates"
        description="Pre-built workflows for common enterprise scenarios."
        actions={
          <Link 
            href="/dashboard/workflows"
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workflows
          </Link>
        }
      />

      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6"
        >
          <Construction className="w-12 h-12 text-yellow-500" />
        </motion.div>
        
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white mb-3"
        >
          Templates Coming Soon
        </motion.h2>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 max-w-md mx-auto"
        >
          The template gallery requires a backend API update which is currently in development. 
          Soon, you'll be able to instantly clone pre-configured enterprise workflows.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-xl inline-flex flex-col gap-2 text-left"
        >
          <div className="text-sm font-semibold text-white">Planned Categories:</div>
          <ul className="text-sm text-zinc-500 space-y-1">
            <li>• AI Lead Qualification & CRM Sync</li>
            <li>• Customer Support Triage & Auto-Reply</li>
            <li>• Invoice Extraction & Approval Routing</li>
            <li>• Knowledge Base Document Processing</li>
          </ul>
        </motion.div>
      </div>
    </ContentWrapper>
  );
}
