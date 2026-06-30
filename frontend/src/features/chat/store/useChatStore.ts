import { create } from 'zustand';
import { Conversation, Message, Citation, ChatMetrics, Agent } from '../types/chat';

interface ChatState {
  activeConversation: Conversation | null;
  conversations: Conversation[];
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  streamingSources: Citation[];
  streamingMetrics: ChatMetrics | null;
  selectedAgent: Agent | null;
  
  // Actions
  setActiveConversation: (conversation: Conversation | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  
  // Streaming actions
  setStreaming: (isStreaming: boolean) => void;
  appendStreamingContent: (content: string) => void;
  setStreamingSources: (sources: Citation[]) => void;
  setStreamingMetrics: (metrics: ChatMetrics) => void;
  clearStreaming: () => void;
  
  setSelectedAgent: (agent: Agent | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversation: null,
  conversations: [],
  messages: [],
  isStreaming: false,
  streamingContent: '',
  streamingSources: [],
  streamingMetrics: null,
  selectedAgent: null,

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) => set((state) => ({ conversations: [conversation, ...state.conversations] })),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  setStreaming: (isStreaming) => set({ isStreaming }),
  appendStreamingContent: (content) => set((state) => ({ streamingContent: state.streamingContent + content })),
  setStreamingSources: (sources) => set({ streamingSources: sources }),
  setStreamingMetrics: (metrics) => set({ streamingMetrics: metrics }),
  clearStreaming: () => set({
    isStreaming: false,
    streamingContent: '',
    streamingSources: [],
    streamingMetrics: null
  }),

  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
}));
