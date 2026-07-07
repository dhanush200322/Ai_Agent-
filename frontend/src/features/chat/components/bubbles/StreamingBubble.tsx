import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Sparkles, StopCircle } from 'lucide-react';
import { AgentAvatar } from '@/components/common/AgentAvatar';

export const StreamingBubble: React.FC<{ 
  content: string, 
  agentName?: string,
  agentAvatar?: string,
  onStop?: () => void
}> = ({ content, agentName, agentAvatar, onStop }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (content) return;
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, [content]);

  return (
    <div className="flex w-full justify-start mb-6 group">
      <div className="flex gap-4 max-w-[90%] w-full">
        <div className="relative shrink-0">
          <AgentAvatar
            imageUrl={agentAvatar}
            name={agentName}
            size="chat-bubble"
          />
          <div className="absolute inset-0 bg-yellow-500/10 animate-pulse rounded-full pointer-events-none"></div>
        </div>
        
        <div className="flex-1 space-y-2 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{agentName || 'AI Agent'}</span>
            <span className="text-[10px] text-yellow-500 animate-pulse flex items-center gap-1">
              Generating Response{dots}
            </span>
          </div>
          
          <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:max-w-full prose-pre:overflow-x-auto break-words">
            {content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content + '▌'}
              </ReactMarkdown>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse"></div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onStop}
              className="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md transition-colors text-xs font-medium"
            >
              <StopCircle className="w-3 h-3" /> Stop Generation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
