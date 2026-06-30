import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, Mic } from 'lucide-react';

export const MessageComposer: React.FC<{ 
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop?: () => void;
}> = ({ onSend, isStreaming, onStop }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.csv')) {
        const text = await file.text();
        setInput(prev => prev + `\n\n--- Attached File: ${file.name} ---\n${text.substring(0, 2000)}${text.length > 2000 ? '\n...[truncated]' : ''}\n-----------------------------------\n`);
      } else {
        alert('Currently only text-based files are supported for attachments in the demo.');
      }
      e.target.value = ''; // Reset
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in your browser.');
        return;
      }
      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev ? prev + ' ' + transcript : transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    if (input.trim() && !isStreaming) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-zinc-900 border border-zinc-700 rounded-2xl p-2 focus-within:border-yellow-500/50 focus-within:ring-1 focus-within:ring-yellow-500/20 transition-all shadow-sm">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".txt,.md,.json,.csv"
        />
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors mb-0.5"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your enterprise agent..."
          className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder-zinc-500 resize-none max-h-[200px] py-2.5 px-2"
          rows={1}
        />

        {isStreaming ? (
          <button 
            onClick={onStop}
            className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors mb-0.5"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        ) : (
          <div className="flex gap-1 mb-0.5">
            <button 
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-colors ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
              title={isListening ? 'Stop listening' : 'Start voice typing'}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 bg-yellow-500 text-black disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      <div className="text-center mt-2">
        <span className="text-[10px] text-zinc-500">
          AI can make mistakes. Verify important enterprise information.
        </span>
      </div>
    </div>
  );
};
