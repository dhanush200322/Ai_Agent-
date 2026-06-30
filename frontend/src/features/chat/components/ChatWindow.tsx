import React from 'react';
import { ConversationHeader } from './ConversationHeader';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { ContextPanel } from './rag/ContextPanel';
import { useChatStore } from '../store/useChatStore';
import { chatService } from '../services/chat.service';

export const ChatWindow: React.FC = () => {
  const { 
    activeConversation, 
    isStreaming, 
    setStreaming, 
    appendStreamingContent, 
    setStreamingSources, 
    setStreamingMetrics, 
    clearStreaming, 
    addMessage, 
    selectedAgent 
  } = useChatStore();

  const handleSend = async (messageContent: string) => {
    if (!activeConversation || !selectedAgent) return;

    const userMessage = {
      id: window.crypto.randomUUID(),
      conversationId: activeConversation.id,
      role: 'USER' as const,
      content: messageContent,
      createdAt: new Date().toISOString(),
    };
    
    addMessage(userMessage);
    clearStreaming();
    setStreaming(true);

    try {
      await chatService.streamChatCompletion(
        {
          agentId: selectedAgent.id,
          conversationId: activeConversation.id,
          message: messageContent
        },
        {
          onToken: (token) => appendStreamingContent(token),
          onSources: (sources) => setStreamingSources(sources),
          onMetrics: (metrics) => setStreamingMetrics(metrics),
          onError: (error) => console.error('Stream error:', error),
          onComplete: () => {
            setStreaming(false);
            const { streamingContent, streamingSources } = useChatStore.getState();
            addMessage({
              id: window.crypto.randomUUID(),
              conversationId: activeConversation.id,
              role: 'ASSISTANT',
              content: streamingContent,
              citations: streamingSources,
              createdAt: new Date().toISOString(),
            });
            clearStreaming();
          }
        }
      );
    } catch (error) {
      console.error('Failed to send message', error);
      setStreaming(false);
    }
  };

  if (!activeConversation) return null;

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        <ConversationHeader />
        <MessageList />
        <MessageComposer 
          onSend={handleSend} 
          isStreaming={isStreaming} 
        />
      </div>
      <ContextPanel />
    </div>
  );
};
