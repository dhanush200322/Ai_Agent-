'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { useKnowledgeBase, useDocuments, useDeleteKnowledgeBase } from '@/features/knowledge/hooks/useKnowledge';
import { Loader2, ArrowLeft, Trash2, Edit3, Settings, Users, Activity, Layers, HardDrive, X } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import Link from 'next/link';
import { DocumentUploader } from '@/features/knowledge/components/DocumentUploader';
import { DocumentList } from '@/features/knowledge/components/DocumentList';
import { PlaceholderTab } from '@/components/ui/PlaceholderTab';
import { WebsiteUrlIngestion } from '@/features/knowledge/components/WebsiteUrlIngestion';
import { FaqBuilder } from '@/features/knowledge/components/FaqBuilder';
import { ManualTextEntry } from '@/features/knowledge/components/ManualTextEntry';
import { BulkImport } from '@/features/knowledge/components/BulkImport';
import { ConnectAgentDialog } from '@/features/knowledge/components/ConnectAgentDialog';
import { useKnowledgeAgents, useDetachAgent } from '@/features/knowledge/hooks/useKnowledgeAgents';
import { toast } from 'sonner';


export default function KnowledgeBaseDetails() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'documents' | 'website' | 'faq' | 'text' | 'bulk' | 'agents' | 'settings'>('documents');
  const [isConnectAgentOpen, setIsConnectAgentOpen] = useState(false);
  
  const { data: kb, isLoading: isKbLoading } = useKnowledgeBase(id);
  const { data: documents, isLoading: isDocsLoading } = useDocuments(id);
  const { mutateAsync: deleteKB } = useDeleteKnowledgeBase();

  const { data: agents, isLoading: isAgentsLoading } = useKnowledgeAgents(id);
  const { mutateAsync: detachAgent, isPending: isDetachingAgent } = useDetachAgent(id);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to permanently delete this Knowledge Base?')) {
      try {
        await deleteKB(id);
        toast.success('Knowledge Base deleted');
        router.push('/dashboard/knowledge');
      } catch (err) {
        toast.error('Failed to delete knowledge base');
      }
    }
  };

  const handleDetachAgent = async (agentId: string) => {
    try {
      await detachAgent(agentId);
      toast.success('Agent detached successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to detach Agent');
    }
  };

  if (isKbLoading) {
    return (
      <ContentWrapper>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        </div>
      </ContentWrapper>
    );
  }

  if (!kb) {
    return (
      <ContentWrapper>
        <div className="text-center py-20 text-gray-500">Knowledge Base not found</div>
      </ContentWrapper>
    );
  }

  const tabs = [
    { id: 'documents', label: 'Documents' },
    { id: 'website', label: 'Website URLs' },
    { id: 'faq', label: 'FAQs' },
    { id: 'text', label: 'Manual Text' },
    { id: 'bulk', label: 'Bulk Import' },
    { id: 'agents', label: 'Connected Agents' },
    { id: 'settings', label: 'Settings' }
  ] as const;


  return (
    <ContentWrapper>
      <div className="mb-6">
        <Link href="/dashboard/knowledge" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Knowledge Bases
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{kb.name}</h1>
          <p className="text-gray-400 max-w-2xl">{kb.description || 'No description provided.'}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleDelete}
            className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
            title="Delete Knowledge Base"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <MagneticButton variant="secondary" className="px-4 py-2.5">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Info
          </MagneticButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-[rgba(255,255,255,0.05)] mb-8 overflow-x-auto pb-px [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id 
                ? 'text-[#D4AF37] border-[#D4AF37]' 
                : 'text-gray-400 border-transparent hover:text-white hover:border-[rgba(255,255,255,0.2)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pb-20">


        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-semibold text-white">Manage Documents</h2>
              <MagneticButton onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })} variant="primary" className="px-4 py-2">
                Upload New
              </MagneticButton>
            </div>
            
            {isDocsLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : (
              <DocumentList documents={documents || []} knowledgeBaseId={id} />
            )}

            <div id="upload-section" className="pt-8 mt-8 border-t border-[rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-semibold text-white mb-4">Upload Documents</h3>
              <DocumentUploader knowledgeBaseId={id} />
            </div>
          </div>
        )}

        {activeTab === 'website' && (
          <WebsiteUrlIngestion knowledgeBaseId={id} />
        )}

        {activeTab === 'faq' && (
          <FaqBuilder knowledgeBaseId={id} />
        )}

        {activeTab === 'text' && (
          <ManualTextEntry knowledgeBaseId={id} />
        )}

        {activeTab === 'bulk' && (
          <BulkImport knowledgeBaseId={id} />
        )}

        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Connected Agents</h3>
              <MagneticButton onClick={() => setIsConnectAgentOpen(true)} variant="primary" className="px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                Connect Agent
              </MagneticButton>
            </div>

            {isAgentsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" /></div>
            ) : agents?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl bg-[rgba(255,255,255,0.01)]">
                <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Agents Connected</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  Connect agents to this knowledge base so they can retrieve documents from it.
                </p>
                <MagneticButton onClick={() => setIsConnectAgentOpen(true)} variant="secondary" className="px-5 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  Connect Agent
                </MagneticButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents?.map((agent: any) => (
                  <div key={agent.id} className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl flex items-start justify-between group">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden shrink-0">
                        {agent.avatar ? <img src={agent.avatar} alt={agent.name || 'Agent avatar'} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">{agent.name}</h4>
                        {agent.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{agent.description}</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDetachAgent(agent.id)}
                      disabled={isDetachingAgent}
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Detach"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <PlaceholderTab 
            name="Knowledge Base Settings"
            icon={Settings}
            description="Rename, delete, or configure vector embedding chunk sizes (Backend API Required)."
          />
        )}
      </div>

      <ConnectAgentDialog
        isOpen={isConnectAgentOpen}
        onClose={() => setIsConnectAgentOpen(false)}
        knowledgeBaseId={id}
      />
    </ContentWrapper>
  );
}
