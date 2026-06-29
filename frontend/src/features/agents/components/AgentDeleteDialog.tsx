import React from 'react';
import { Agent } from '../types/agent';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface AgentDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agentName: string;
  isDeleting: boolean;
}

export function AgentDeleteDialog({ isOpen, onClose, onConfirm, agentName, isDeleting }: AgentDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl p-6 transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4 border border-red-500/20">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Delete Agent</h3>
        
        <p className="text-gray-400 mb-6 leading-relaxed">
          Are you sure you want to delete <span className="text-white font-medium">"{agentName}"</span>? 
          This action will archive the agent and permanently disable its tool executions. This cannot be undone.
        </p>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-500/20 transition-all disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Yes, delete agent
          </button>
        </div>
      </div>
    </div>
  );
}
