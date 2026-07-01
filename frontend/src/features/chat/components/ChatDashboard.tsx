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
    addConversation,
    isMobileSidebarOpen,
    setMobileSidebarOpen
  } = useChatStore();

  const handleSelectConversation = async (conv: any) => {
    setActiveConversation(conv);
    setMobileSidebarOpen(false); // Close sidebar on selection (mobile)
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
      setMobileSidebarOpen(false);
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  };

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K could focus search (skipped here for simplicity)
      if (e.key === 'Escape') {
        if (isMobileSidebarOpen) setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen, setMobileSidebarOpen]);

  return (
    <div className="h-screen w-full flex bg-zinc-950 text-white overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <ConversationSidebar 
          onSelect={handleSelectConversation} 
          onNewChat={handleNewChat} 
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {activeConversation ? (
          <ChatWindow />
        ) : (
          <WelcomeScreen onNewChat={handleNewChat} />
        )}
      </div>
    </div>
  );
};
