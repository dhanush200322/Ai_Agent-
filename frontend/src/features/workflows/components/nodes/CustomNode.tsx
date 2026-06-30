import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { getNodeDef } from '../../config/nodeRegistry';
import { Settings } from 'lucide-react';

export default function CustomNode({ data, type, selected }: { data: any, type: string, selected: boolean }) {
  const def = getNodeDef(type);

  if (!def) {
    return (
      <div className="px-4 py-2 shadow-md rounded-md bg-red-900 border border-red-500">
        <div className="text-white text-xs font-bold">Unknown Node Type: {type}</div>
      </div>
    );
  }

  return (
    <div className={`shadow-xl rounded-xl border-2 transition-colors min-w-[200px] ${
      selected ? 'border-yellow-500 shadow-yellow-500/20' : 'border-zinc-800 hover:border-zinc-700'
    } bg-zinc-950 overflow-hidden`}>
      
      {/* Handles */}
      {type !== 'trigger' && (
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-800 border-2 border-zinc-950" />
      )}
      
      {/* Header */}
      <div className={`p-3 border-b flex items-center justify-between ${def.color.replace('border-', 'border-b-')}`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-950/50 rounded-lg">
            <def.icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">{data.label || def.label}</span>
        </div>
        {selected && <Settings className="w-4 h-4 opacity-50" />}
      </div>

      {/* Body */}
      <div className="p-3 bg-zinc-900/50">
        <p className="text-xs text-zinc-400 line-clamp-2">
          {data.config?.prompt 
            ? data.config.prompt 
            : data.config?.url 
              ? `${data.config.method || 'GET'} ${data.config.url}`
              : def.description}
        </p>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-zinc-800 border-2 border-zinc-950" />
    </div>
  );
}
