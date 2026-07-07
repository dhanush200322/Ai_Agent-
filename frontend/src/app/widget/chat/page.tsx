'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { chatService } from '@/features/chat/services/chat.service';
import { agentService } from '@/features/agents/services/agent.service';
import { Message } from '@/features/chat/types/chat';
import { AgentAvatar } from '@/components/common/AgentAvatar';

export default function WidgetChatPage() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agentId');
  const theme = searchParams.get('theme') || 'dark';
  const botColor = searchParams.get('color') || '#eab308';
  
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const streamingContentRef = useRef('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (agentId) {
      fetch(`/api/widget-agents/${agentId}`)
        .then(res => res.json())
        .then(response => {
          if (response.success && response.data) {
            setAgent(response.data);
          } else {
            setError('Failed to load agent configuration.');
          }
        })
        .catch(err => setError('Network error while loading agent.'));
    }
  }, [agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);



  const handleComplete = (currentConvId: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        conversationId: currentConvId,
        role: 'ASSISTANT',
        content: streamingContentRef.current,
        createdAt: new Date().toISOString()
      }
    ]);
    setStreamingContent('');
    setIsStreaming(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !agentId) return;

    const userMsg = input.trim();
    setInput('');
    setError(null);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      conversationId: conversationId || '',
      role: 'USER',
      content: userMsg,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsStreaming(true);
    streamingContentRef.current = '';
    setStreamingContent('');

    try {
      let currentConvId = conversationId;
      if (!currentConvId) {
        const conv = await chatService.createConversation(agentId, undefined, true);
        currentConvId = conv.id;
        setConversationId(conv.id);
      }

      await chatService.streamChatCompletion(
        { agentId, conversationId: currentConvId, message: userMsg, isWidget: true },
        {
          onToken: (token) => {
            streamingContentRef.current += token;
            setStreamingContent(streamingContentRef.current);
          },
          onSources: () => {},
          onMetrics: () => {},
          onError: (err) => setError(err),
          onComplete: () => handleComplete(currentConvId!)
        }
      );
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsStreaming(false);
    }
  };


  if (error && !agent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white p-6 text-center">
        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Agent Not Found</h3>
        <p className="text-sm text-zinc-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300" style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#09090b', color: theme === 'light' ? '#18181b' : '#ffffff' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: theme === 'light' ? '#e4e4e7' : '#27272a', backgroundColor: theme === 'light' ? '#f4f4f5' : 'rgba(24,24,27,0.5)' }}>
        <div className="shrink-0">
          <AgentAvatar
            imageUrl={agent?.avatar}
            name={agent?.name}
            size="widget-launcher"
            className="w-10 h-10 shadow-lg"
            updatedAt={agent?.updatedAt}
          />
        </div>
        <div>
          <h1 className="font-semibold text-sm">{agent ? agent.name : 'Loading Agent...'}</h1>
          <p className="text-xs text-zinc-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: theme === 'light' ? '#ffffff' : 'rgba(9,9,11,0.5)' }}>
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full opacity-50 text-center space-y-3">
            <AgentAvatar
              imageUrl={agent?.avatar}
              name={agent?.name}
              size="dashboard-card"
              className="w-16 h-16 shadow-xl mb-2"
              updatedAt={agent?.updatedAt}
            />
            <p className="text-sm" style={{ color: theme === 'light' ? '#71717a' : '#a1a1aa' }}>
              {agent ? `Hi! I'm ${agent.name}. How can I help you today?` : 'Initializing agent...'}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'USER' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'USER' ? '' : 'overflow-hidden'}`}
                 style={{ backgroundColor: msg.role === 'USER' ? (theme === 'light' ? '#e4e4e7' : '#27272a') : `${botColor}33`, color: msg.role === 'USER' ? '' : botColor }}>
              {msg.role === 'USER' ? (
                <User className="w-4 h-4" style={{ color: theme === 'light' ? '#71717a' : '#a1a1aa' }} />
              ) : (
                <AgentAvatar
                  imageUrl={agent?.avatar}
                  name={agent?.name}
                  size="chat-bubble"
                  className="w-8 h-8"
                  updatedAt={agent?.updatedAt}
                />
              )}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'USER' ? 'rounded-tr-sm' : 'border rounded-tl-sm'}`}
                 style={msg.role === 'USER' ? { backgroundColor: botColor, color: '#ffffff' } : { backgroundColor: theme === 'light' ? '#f4f4f5' : '#18181b', borderColor: theme === 'light' ? '#e4e4e7' : '#27272a', color: theme === 'light' ? '#18181b' : '#d4d4d8' }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex gap-3">
             <div className="shrink-0">
               <AgentAvatar
                 imageUrl={agent?.avatar}
                 name={agent?.name}
                 size="chat-bubble"
                 className="w-8 h-8"
                 updatedAt={agent?.updatedAt}
               />
             </div>
             <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm border rounded-tl-sm"
                  style={{ backgroundColor: theme === 'light' ? '#f4f4f5' : '#18181b', borderColor: theme === 'light' ? '#e4e4e7' : '#27272a', color: theme === 'light' ? '#18181b' : '#d4d4d8' }}>
                {streamingContent}
                <span className="inline-block w-1.5 h-4 ml-1 animate-pulse align-middle" style={{ backgroundColor: botColor }}></span>
             </div>
          </div>
        )}

        {error && messages.length > 0 && (
          <div className="text-center text-xs text-red-500 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: theme === 'light' ? '#e4e4e7' : '#27272a', backgroundColor: theme === 'light' ? '#f4f4f5' : 'rgba(24,24,27,0.5)' }}>
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!agent || isStreaming}
            placeholder={isStreaming ? "Agent is typing..." : "Type your message..."}
            className="w-full border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none disabled:opacity-50 transition-all"
            style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#09090b', borderColor: theme === 'light' ? '#e4e4e7' : '#27272a', color: theme === 'light' ? '#18181b' : '#ffffff' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || !agent || isStreaming}
            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"
            style={{ backgroundColor: botColor, color: '#ffffff' }}
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5" />}
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] flex items-center justify-center gap-1" style={{ color: theme === 'light' ? '#71717a' : '#a1a1aa' }}>
            <Sparkles className="w-3 h-3" />
            Powered by Nexora AI
          </span>
        </div>
      </div>
    </div>
  );
}
