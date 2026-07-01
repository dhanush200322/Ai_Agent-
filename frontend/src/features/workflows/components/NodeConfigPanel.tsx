import React, { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';
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
    <div className="w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full shadow-2xl z-20 animate-in slide-in-from-right absolute right-0 top-0">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <def.icon className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-white">{def.label} Configuration</h3>
        </div>
        <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white rounded transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Node Label</label>
          <input 
            type="text" 
            value={node.data.label as string} 
            onChange={(e) => onChange({ label: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none transition-shadow"
          />
        </div>

        {def.configFields.length > 0 && <div className="border-t border-zinc-800" />}

        {def.configFields.map(field => (
          <div key={field.name}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea 
                value={config[field.name] || ''} 
                onChange={(e) => handleConfigChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none resize-y font-mono"
              />
            ) : field.type === 'select' ? (
              <select
                value={config[field.name] || ''}
                onChange={(e) => handleConfigChange(field.name, e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none"
              >
                <option value="">Select...</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : field.type === 'json' ? (
              <JsonEditor 
                value={config[field.name] || {}} 
                onChange={(val) => handleConfigChange(field.name, val)} 
              />
            ) : field.type === 'delayBuilder' ? (
              <DelayBuilder 
                value={config[field.name] || 0} 
                onChange={(val) => handleConfigChange(field.name, val)} 
              />
            ) : field.type === 'conditionBuilder' ? (
              <ConditionBuilder 
                value={config[field.name] || ''} 
                onChange={(val) => handleConfigChange(field.name, val)} 
              />
            ) : (
              <input 
                type={field.type === 'number' ? 'number' : 'text'} 
                value={config[field.name] || ''} 
                onChange={(e) => handleConfigChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none font-mono"
              />
            )}
          </div>
        ))}

        {def.configFields.length === 0 && (
          <div className="text-sm text-zinc-500 italic p-6 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
            No configuration needed for this node type.
          </div>
        )}
      </div>
    </div>
  );
}

function JsonEditor({ value, onChange }: { value: any, onChange: (val: any) => void }) {
  const [strValue, setStrValue] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState(false);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(strValue);
      onChange(parsed);
      setError(false);
      setStrValue(JSON.stringify(parsed, null, 2));
    } catch {
      setError(true);
    }
  };

  return (
    <div>
      <textarea 
        value={strValue} 
        onChange={(e) => { setStrValue(e.target.value); setError(false); }}
        onBlur={handleBlur}
        rows={5}
        className={`w-full bg-zinc-950 border rounded-xl px-3 py-2 text-sm text-white outline-none resize-y font-mono ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-zinc-800 focus:ring-1 focus:ring-yellow-500'}`}
      />
      {error && <span className="text-xs text-red-500 mt-1 block">Invalid JSON format</span>}
    </div>
  );
}

function DelayBuilder({ value, onChange }: { value: number, onChange: (val: number) => void }) {
  const [unit, setUnit] = useState<'ms' | 's' | 'm' | 'h'>('s');
  const [amount, setAmount] = useState(value / 1000);

  React.useEffect(() => {
    let multiplier = 1;
    if (unit === 's') multiplier = 1000;
    if (unit === 'm') multiplier = 1000 * 60;
    if (unit === 'h') multiplier = 1000 * 60 * 60;
    onChange(amount * multiplier);
  }, [amount, unit, onChange]);

  return (
    <div className="flex gap-2">
      <input 
        type="number" 
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none"
      />
      <select 
        value={unit}
        onChange={(e) => setUnit(e.target.value as any)}
        className="w-24 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none"
      >
        <option value="ms">ms</option>
        <option value="s">Seconds</option>
        <option value="m">Minutes</option>
        <option value="h">Hours</option>
      </select>
    </div>
  );
}

function ConditionBuilder({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  // Convert standard string to basic builder state if possible
  const isSimple = !value || value.match(/^(.+?)\s+(===|!==|>|<|>=|<=)\s+(.+)$/);
  
  const [useBuilder, setUseBuilder] = useState(!!isSimple);

  const parseValue = () => {
    const match = value?.match(/^(.+?)\s+(===|!==|>|<|>=|<=)\s+(.+)$/);
    if (match) return { left: match[1], op: match[2], right: match[3] };
    return { left: '', op: '===', right: '' };
  };

  const [builderState, setBuilderState] = useState(parseValue());

  const updateBuilder = (field: string, val: string) => {
    const next = { ...builderState, [field]: val };
    setBuilderState(next);
    onChange(`${next.left} ${next.op} ${next.right}`);
  };

  if (!useBuilder) {
    return (
      <div>
        <textarea 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. outputs.node_1.score > 80"
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none resize-y font-mono"
        />
        <button onClick={() => setUseBuilder(true)} className="text-xs text-yellow-500 mt-2 hover:underline">Switch to Visual Builder</button>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
      <input 
        type="text" 
        placeholder="Variable (e.g. outputs.n1.value)"
        value={builderState.left}
        onChange={(e) => updateBuilder('left', e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none font-mono"
      />
      <select 
        value={builderState.op}
        onChange={(e) => updateBuilder('op', e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
      >
        <option value="===">Equals</option>
        <option value="!==">Not Equals</option>
        <option value=">">Greater Than</option>
        <option value="<">Less Than</option>
        <option value=">=">Greater or Equal</option>
        <option value="<=">Less or Equal</option>
      </select>
      <input 
        type="text" 
        placeholder="Value (e.g. 100 or 'yes')"
        value={builderState.right}
        onChange={(e) => updateBuilder('right', e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none font-mono"
      />
      <button onClick={() => setUseBuilder(false)} className="text-xs text-yellow-500 mt-2 hover:underline">Switch to Raw Expression</button>
    </div>
  );
}
