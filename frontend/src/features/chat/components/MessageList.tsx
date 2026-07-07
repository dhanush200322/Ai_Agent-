import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { UserBubble } from './bubbles/UserBubble';
import { AssistantBubble } from './bubbles/AssistantBubble';
import { StreamingBubble } from './bubbles/StreamingBubble';

export const MessageList: React.FC = () => {
  const { messages, isStreaming, streamingContent, streamingSources, selectedAgent } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-2">
      <div className="max-w-4xl mx-auto w-full">
        {messages.map((message) => {
          if (message.role === 'USER') {
            return <UserBubble key={message.id} message={message} />;
          }
          if (message.role === 'ASSISTANT') {
            // Note: In a real app we might parse citations out of the message or link them
            return (
              <AssistantBubble 
                key={message.id} 
                message={message} 
                agentName={selectedAgent?.name}
                agentAvatar={selectedAgent?.avatar}
                agentUpdatedAt={selectedAgent?.updatedAt}
                citations={message.citations}
              />
            );
          }
          return null;
        })}

        {isStreaming && (
          <StreamingBubble 
            content={streamingContent} 
            agentName={selectedAgent?.name}
            agentAvatar={selectedAgent?.avatar}
            agentUpdatedAt={selectedAgent?.updatedAt}
            onStop={() => {
              // Not directly abortable from UI state alone, but we could add an abort controller to the store
            }}
          />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
