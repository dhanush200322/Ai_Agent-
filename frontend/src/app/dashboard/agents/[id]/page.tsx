'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { useAgent, useUpdateAgent, useDeleteAgent } from '@/features/agents/hooks/useAgents';
import { AgentDeleteDialog } from '@/features/agents/components/AgentDeleteDialog';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { toast } from 'sonner';
import { 
  Bot, Settings, AlignLeft, Database, Plug, 
  BarChart, ScrollText, ArrowLeft, Loader2, Save, Trash2
} from 'lucide-react';
import Link from 'next/link';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Bot },
  { id: 'configuration', label: 'Configuration', icon: Settings },
  { id: 'prompt', label: 'Prompt', icon: AlignLeft },
  { id: 'knowledge', label: 'Knowledge', icon: Database },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function AgentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: agent, isLoading, error } = useAgent(id);
  const { mutateAsync: updateAgent, isPending: isUpdating } = useUpdateAgent(id);
  const { mutateAsync: deleteAgent, isPending: isDeleting } = useDeleteAgent();

  // Local state for edits
  const [editForm, setEditForm] = useState<any>({});

  // Sync edit form with agent data when loaded
  React.useEffect(() => {
    if (agent) {
      setEditForm({
        name: agent.name,
        description: agent.description || '',
        model: agent.model,
        temperature: agent.temperature,
        topP: agent.topP,
        maxTokens: agent.maxTokens,
        visibility: agent.visibility,
        status: agent.status,
        systemPrompt: agent.systemPrompt || '',
      });
    }
  }, [agent]);

  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" /></div>
      </ContentWrapper>
    );
  }

  if (error || !agent) {
    return (
      <ContentWrapper>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center">
          Agent not found or you don't have permission to view it.
        </div>
      </ContentWrapper>
    );
  }

  const handleUpdate = async () => {
    try {
      await updateAgent(editForm);
      toast.success('Agent updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update agent');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAgent(id);
      toast.success('Agent deleted successfully');
      router.push('/dashboard/agents');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete agent');
      setIsDeleteDialogOpen(false);
    }
  };

  const PlaceholderTab = ({ name }: { name: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl bg-[rgba(255,255,255,0.01)] mt-6">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center mb-6">
        <Bot className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{name} (Coming Soon)</h3>
      <p className="text-gray-400 max-w-md mb-4">
        This feature is backend ready but the frontend UI is a placeholder for future phases.
      </p>
      <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded text-xs">Phase 4+ Integration</span>
    </div>
  );

  return (
    <ContentWrapper>
      <div className="mb-6">
        <Link href="/dashboard/agents" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Agents
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden shrink-0">
              {agent.avatar ? <img src={agent.avatar} className="w-full h-full object-cover" /> : <Bot className="w-8 h-8 text-[#D4AF37]" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">{agent.name}</h1>
              <p className="text-sm text-gray-400 mt-1 font-mono">{agent.slug}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="p-2.5 rounded-lg text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <MagneticButton onClick={handleUpdate} variant="primary" className="px-5 py-2.5">
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-6 border-b border-[rgba(255,255,255,0.05)] scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive ? 'bg-[rgba(255,255,255,0.05)] text-white' : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-[#D4AF37]' : 'text-gray-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6">
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">General Information</h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Agent Name</label>
                <input 
                  value={editForm.name || ''} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea 
                  value={editForm.description || ''}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  rows={4}
                  className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Status & Visibility</h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Agent Status</label>
                <select 
                  value={editForm.status || 'ACTIVE'}
                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                  className="w-full bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                >
                  <option value="ACTIVE">Active (Running)</option>
                  <option value="INACTIVE">Inactive (Draft)</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Visibility</label>
                <select 
                  value={editForm.visibility || 'PRIVATE'}
                  onChange={e => setEditForm({...editForm, visibility: e.target.value})}
                  className="w-full bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                >
                  <option value="PRIVATE">Private</option>
                  <option value="ORGANIZATION">Organization</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">LLM Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Model Architecture</label>
                <select 
                  value={editForm.model || 'gpt-4o'}
                  onChange={e => setEditForm({...editForm, model: e.target.value})}
                  className="w-full bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                >
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="gpt-4-turbo">OpenAI GPT-4 Turbo</option>
                  <option value="claude-3-opus">Anthropic Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Anthropic Claude 3 Sonnet</option>
                  <option value="llama-3-70b-instruct">Meta Llama 3 70B</option>
                  <option value="mixtral-8x7b-instruct">Mistral Mixtral 8x7B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Max Tokens</label>
                <input 
                  type="number"
                  value={editForm.maxTokens || 2048}
                  onChange={e => setEditForm({...editForm, maxTokens: Number(e.target.value)})}
                  className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Temperature ({editForm.temperature})</label>
                <input 
                  type="range" min="0" max="2" step="0.1"
                  value={editForm.temperature || 0.7}
                  onChange={e => setEditForm({...editForm, temperature: Number(e.target.value)})}
                  className="w-full accent-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Top P ({editForm.topP})</label>
                <input 
                  type="range" min="0" max="1" step="0.05"
                  value={editForm.topP || 1.0}
                  onChange={e => setEditForm({...editForm, topP: Number(e.target.value)})}
                  className="w-full accent-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">System Prompt</h3>
            <textarea 
              value={editForm.systemPrompt || ''}
              onChange={e => setEditForm({...editForm, systemPrompt: e.target.value})}
              rows={16}
              className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg py-4 px-4 text-white font-mono text-sm focus:border-[#D4AF37] focus:outline-none transition-colors resize-y min-h-[300px]"
              placeholder="You are a helpful AI assistant..."
            />
          </div>
        )}

        {['knowledge', 'integrations', 'analytics', 'logs', 'settings'].includes(activeTab) && (
          <PlaceholderTab name={TABS.find(t => t.id === activeTab)?.label || ''} />
        )}

      </div>

      <AgentDeleteDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        agentName={agent.name}
        isDeleting={isDeleting}
      />
    </ContentWrapper>
  );
}
