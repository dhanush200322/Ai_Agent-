import React from 'react';
import { Copy, Trash, CopyPlus, Layout } from 'lucide-react';
import { Node } from '@xyflow/react';

interface ContextMenuProps {
  id: string;
  top: number;
  left: number;
  right?: number;
  bottom?: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onAutoLayout?: () => void;
  onClick?: () => void;
}

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  onDuplicate,
  onDelete,
  onAutoLayout,
  onClick
}: ContextMenuProps) {
  return (
    <div
      className="absolute bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 min-w-[160px] p-1 text-sm text-zinc-300"
      style={{ top, left, right, bottom }}
      onClick={onClick}
    >
      <div className="px-2 py-1.5 font-medium text-xs text-zinc-500 border-b border-zinc-800 mb-1">
        Node Options
      </div>
      <button 
        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800 rounded transition-colors text-left"
        onClick={onDuplicate}
      >
        <CopyPlus className="w-4 h-4" />
        Duplicate
      </button>
      {onAutoLayout && (
        <button 
          className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800 rounded transition-colors text-left"
          onClick={onAutoLayout}
        >
          <Layout className="w-4 h-4" />
          Auto Layout
        </button>
      )}
      <div className="my-1 border-t border-zinc-800" />
      <button 
        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-red-500/10 hover:text-red-500 rounded transition-colors text-left text-red-400"
        onClick={onDelete}
      >
        <Trash className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}
