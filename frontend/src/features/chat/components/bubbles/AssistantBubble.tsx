import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // or any highlight.js style
import { Sparkles, Copy, ThumbsUp, ThumbsDown, Bookmark, RotateCw, Trash2, Share, Database, FileText, ChevronDown, ExternalLink } from 'lucide-react';
import { Message, Citation } from '../../types/chat';
import { AgentAvatar } from '@/components/common/AgentAvatar';

export const AssistantBubble: React.FC<{ 
  message: Message, 
  citations?: Citation[],
  agentName?: string,
  agentAvatar?: string 
}> = ({ message, citations, agentName, agentAvatar }) => {
  return (
    <div className="flex w-full justify-start mb-6 group">
      <div className="flex gap-4 max-w-[90%]">
        <AgentAvatar
          imageUrl={agentAvatar}
          name={agentName}
          size="chat-bubble"
        />
        
        <div className="flex-1 space-y-2 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{agentName || 'AI Agent'}</span>
            <span className="text-[10px] text-zinc-500">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:max-w-full prose-pre:overflow-x-auto break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Source file matching UI is hidden per user request */}
          {/* citations && citations.length > 0 && (
            <div className="mt-4 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/50">
              <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-medium text-white">Sources ({citations.length})</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Knowledge Base</span>
              </div>
              <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 px-2 font-semibold">Enterprise Docs</div>
                {citations.map((c, i) => (
                  <details key={i} className="group/accordion px-2">
                    <summary className="flex items-center justify-between cursor-pointer list-none py-2 hover:bg-zinc-900/50 rounded-lg px-2 transition-colors">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                        <span className="text-sm text-zinc-300 truncate">{c.fileName || c.originalName}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-zinc-500 group-open/accordion:rotate-180 transition-transform shrink-0" />
                    </summary>
                    <div className="pl-8 pr-2 pb-3 space-y-3">
                      <div className="flex items-center gap-4 text-xs">
                        {c.page && (
                          <span className="flex items-center gap-1 text-zinc-400">
                            <span className="text-zinc-600">Page</span> {c.page}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-zinc-400">
                          <span className="text-zinc-600">Similarity</span> <span className="text-green-500">{Math.round((c.score || 0) * 100)}%</span>
                        </span>
                      </div>
                      {c.snippet && (
                        <div className="p-3 bg-zinc-900 rounded-lg text-xs text-zinc-400 border border-zinc-800 font-mono leading-relaxed line-clamp-3">
                          {c.snippet}
                        </div>
                      )}
                      <button className="text-xs font-medium text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
                        View Source <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )*/}

          {/* Hover Actions */}
          <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {[
              { icon: <Copy className="w-4 h-4" />, label: 'Copy' },
              { icon: <ThumbsUp className="w-4 h-4" />, label: 'Like' },
              { icon: <ThumbsDown className="w-4 h-4" />, label: 'Dislike' },
              { icon: <Bookmark className="w-4 h-4" />, label: 'Bookmark' },
              { icon: <Share className="w-4 h-4" />, label: 'Share' },
              { icon: <RotateCw className="w-4 h-4" />, label: 'Regenerate' },
            ].map((action, i) => (
              <button key={i} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" title={action.label}>
                {action.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
