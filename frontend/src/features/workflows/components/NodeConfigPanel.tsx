import React from 'react';
import { X } from 'lucide-react';
import { Node } from '@xyflow/react';
import { getNodeDef } from '../config/nodeRegistry';

export default function NodeConfigPanel({ node, onChange, onClose }: { node: Node, onChange: (data: any) => void, onClose: () => void }) {
  const def = getNodeDef(node.type!);
  
  if (!def) return null;

  const config = node.data.config as Record<string, any> || {};

  const handleConfigChange = (field: string, value: any) => {
    onChange({ config: { ...config, [field]: value } });
  };

  return (
    <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full shadow-2xl z-20 animate-in slide-in-from-right absolute right-0 top-0">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <def.icon className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-white">{def.label} Configuration</h3>
        </div>
        <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Node Label</label>
          <input 
            type="text" 
            value={node.data.label as string} 
            onChange={(e) => onChange({ label: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500/50 outline-none"
          />
        </div>

        {def.configFields.map(field => (
          <div key={field.name}>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea 
                value={config[field.name] || ''} 
                onChange={(e) => handleConfigChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500/50 outline-none resize-none font-mono"
              />
            ) : field.type === 'select' ? (
              <select
                value={config[field.name] || ''}
                onChange={(e) => handleConfigChange(field.name, e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500/50 outline-none"
              >
                <option value="">Select...</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input 
                type={field.type === 'number' ? 'number' : 'text'} 
                value={config[field.name] || ''} 
                onChange={(e) => handleConfigChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500/50 outline-none"
              />
            )}
          </div>
        ))}

        {def.configFields.length === 0 && (
          <div className="text-sm text-zinc-500 italic p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
            No configuration needed for this node.
          </div>
        )}
      </div>
    </div>
  );
}
