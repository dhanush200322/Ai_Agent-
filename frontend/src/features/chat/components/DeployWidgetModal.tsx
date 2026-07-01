import React, { useState } from 'react';
import { X, Copy, Check, Globe, Code } from 'lucide-react';
import { Agent } from '../types/chat';

interface DeployWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

export const DeployWidgetModal: React.FC<DeployWidgetModalProps> = ({ isOpen, onClose, agent }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const agentId = agent?.id || 'NO_AGENT_SELECTED';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const embedCode = `<script src="${origin}/widget.js" data-agent-id="${agentId}"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Globe className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Deploy Agent to Website</h2>
              <p className="text-sm text-zinc-400">Copy the embed code to add this agent to your site.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-300">Widget Embed Code</h3>
            <p className="text-xs text-zinc-500">
              Paste this snippet right before the closing <code>&lt;/body&gt;</code> tag of your website.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col font-mono text-sm">
              <div className="flex justify-between items-center mb-2 text-xs text-zinc-500 border-b border-zinc-800 pb-2">
                <span className="flex items-center gap-2"><Code className="w-3 h-3" /> HTML</span>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-yellow-500 hover:text-yellow-400 transition-colors bg-yellow-500/10 px-2 py-1 rounded"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <code className="text-zinc-300 break-all">
                <span className="text-pink-500">&lt;script</span> <span className="text-yellow-200">src</span><span className="text-white">=</span><span className="text-green-400">"{origin}/widget.js"</span> <span className="text-yellow-200">data-agent-id</span><span className="text-white">=</span><span className="text-green-400">"{agentId}"</span><span className="text-pink-500">&gt;&lt;/script&gt;</span>
              </code>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
            <Globe className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200/80">
              <span className="text-blue-400 font-semibold block mb-1">Live Preview Enabled</span>
              Once deployed, any changes made to this agent in your dashboard will instantly reflect on your website without needing to update the embed code.
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg shadow-lg shadow-yellow-500/20 transition-all">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
