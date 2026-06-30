import React, { useEffect } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatWindow } from './ChatWindow';
import { WelcomeScreen } from './WelcomeScreen';
import { useChatStore } from '../store/useChatStore';
import { chatService } from '../services/chat.service';

export const ChatDashboard: React.FC = () => {
  const { 
    activeConversation, 
    setActiveConversation, 
    selectedAgent, 
    setMessages,
    addConversation
  } = useChatStore();

  const handleSelectConversation = async (conv: any) => {
    setActiveConversation(conv);
    try {
      const history = await chatService.getConversationHistory(conv.id);
      setMessages(history.reverse() || []); // reverse if needed based on API order
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  const handleNewChat = async () => {
    if (!selectedAgent) return;
    try {
      const newConv = await chatService.createConversation(selectedAgent.id);
      addConversation(newConv);
      setActiveConversation(newConv);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  };

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K could focus search (skipped here for simplicity)
      if (e.key === 'Escape') {
        // e.g., Stop generation
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-full flex bg-zinc-950 text-white overflow-hidden">
      <ConversationSidebar 
        onSelect={handleSelectConversation} 
        onNewChat={handleNewChat} 
      />
      {activeConversation ? (
        <ChatWindow />
      ) : (
        <WelcomeScreen onNewChat={handleNewChat} />
      )}
    </div>
  );
};
