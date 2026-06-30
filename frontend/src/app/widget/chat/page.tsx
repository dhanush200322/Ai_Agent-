'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { chatService } from '@/features/chat/services/chat.service';
import { agentService } from '@/features/agents/services/agent.service';
import { Message } from '@/features/chat/types/chat';

export default function WidgetChatPage() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agentId');
  
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (agentId) {
      agentService.getAgent(agentId)
        .then(setAgent)
        .catch(err => setError('Failed to load agent. Please ensure you are logged in to the Enterprise Dashboard.'));
    }
  }, [agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);


  // We need to fix the capture of streamingContent onComplete
  // Instead of relying on closure state, we let useEffect handle it or we can just append it locally.
  // A simple fix is to track the ref of streamingContent if we need it inside onComplete.
  const streamingContentRef = useRef('');
  useEffect(() => {
    streamingContentRef.current = streamingContent;
  }, [streamingContent]);

  // Patching handleSubmit onComplete to use the ref:
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
    setIsStreaming(false);
    setStreamingContent('');
    streamingContentRef.current = '';
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
    setStreamingContent('');
    streamingContentRef.current = '';

    try {
      let currentConvId = conversationId;
      if (!currentConvId) {
        const conv = await chatService.createConversation(agentId);
        currentConvId = conv.id;
        setConversationId(conv.id);
      }

      await chatService.streamChatCompletion(
        { agentId, conversationId: currentConvId, message: userMsg },
        {
          onToken: (token) => {
            setStreamingContent(prev => prev + token);
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
    <div className="flex flex-col h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
          {agent?.avatarUrl ? (
            <img src={agent.avatarUrl} alt={agent.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <Bot className="w-5 h-5 text-black" />
          )}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full opacity-50 text-center space-y-3">
            <Bot className="w-8 h-8 text-yellow-500" />
            <p className="text-sm text-zinc-400">
              {agent ? `Hi! I'm ${agent.name}. How can I help you today?` : 'Initializing agent...'}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'USER' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'USER' ? 'bg-zinc-800' : 'bg-yellow-500/20 text-yellow-500'}`}>
              {msg.role === 'USER' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'USER' ? 'bg-yellow-500 text-black rounded-tr-sm' : 'bg-zinc-900 border border-zinc-800 rounded-tl-sm text-zinc-300'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
             </div>
             <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm bg-zinc-900 border border-zinc-800 rounded-tl-sm text-zinc-300">
                {streamingContent}
                <span className="inline-block w-1.5 h-4 ml-1 bg-yellow-500 animate-pulse align-middle"></span>
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
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!agent || isStreaming}
            placeholder={isStreaming ? "Agent is typing..." : "Type your message..."}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 disabled:opacity-50 transition-all placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || !agent || isStreaming}
            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-yellow-500 hover:bg-yellow-400 text-black rounded-full flex items-center justify-center disabled:opacity-50 disabled:hover:bg-yellow-500 transition-colors"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5" />}
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-zinc-600 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Powered by Enterprise AI
          </span>
        </div>
      </div>
    </div>
  );
}
