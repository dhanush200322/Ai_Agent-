import React from 'react';
import { Message } from '../../types/chat';

export const UserBubble: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className="flex w-full justify-end mb-4 group">
      <div className="max-w-[80%] bg-yellow-500/10 border border-yellow-500/20 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm">
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <span className="text-[10px] text-zinc-500 mt-2 block text-right">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
