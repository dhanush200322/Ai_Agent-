import { Bot, Link, Play, Pause, GitBranch, Repeat, Clock, Zap } from 'lucide-react';

export type NodeType = 'trigger' | 'ai' | 'tool' | 'webhook' | 'approval' | 'condition' | 'loop' | 'delay';

export interface NodeConfigDef {
  type: NodeType;
  label: string;
  description: string;
  icon: any; // Lucide icon
  color: string;
  defaultConfig: Record<string, any>;
  configFields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'json' | 'delayBuilder' | 'conditionBuilder';
    options?: { label: string; value: string }[];
    placeholder?: string;
    required?: boolean;
  }[];
}

export const SUPPORTED_NODES: NodeConfigDef[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Starting point of the workflow',
    icon: Play,
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    defaultConfig: {},
    configFields: []
  },
  {
    type: 'ai',
    label: 'AI Agent',
    description: 'Executes an LLM prompt',
    icon: Bot,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    defaultConfig: { prompt: '' },
    configFields: [
      { name: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Enter prompt or variables like {{customerName}}', required: true }
    ]
  },
  {
    type: 'tool',
    label: 'Tool Execution',
    description: 'Runs a registered agent tool',
    icon: Zap,
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    defaultConfig: { toolName: '', args: {} },
    configFields: [
      { name: 'toolName', label: 'Tool Name', type: 'text', required: true },
      { name: 'args', label: 'Arguments (JSON)', type: 'json' }
    ]
  },
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Makes an HTTP request',
    icon: Link,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    defaultConfig: { url: '', method: 'POST', headers: {}, body: {} },
    configFields: [
      { name: 'url', label: 'Endpoint URL', type: 'text', required: true },
      { name: 'method', label: 'HTTP Method', type: 'select', options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' }
      ] },
      { name: 'headers', label: 'Headers (JSON)', type: 'json' },
      { name: 'body', label: 'Body Payload (JSON)', type: 'json' }
    ]
  },
  {
    type: 'approval',
    label: 'Manual Approval',
    description: 'Pauses execution until approved',
    icon: Pause,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    defaultConfig: { message: '' },
    configFields: [
      { name: 'message', label: 'Approval Message', type: 'text' }
    ]
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branches workflow based on rules',
    icon: GitBranch,
    color: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    defaultConfig: { expression: '' },
    configFields: [
      { name: 'expression', label: 'Condition Rules', type: 'conditionBuilder' }
    ]
  },
  {
    type: 'loop',
    label: 'Loop',
    description: 'Iterates over an array',
    icon: Repeat,
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    defaultConfig: { listVariable: '', itemVariable: 'currentItem' },
    configFields: [
      { name: 'listVariable', label: 'List Variable (e.g. outputs.node_1.items)', type: 'text', required: true },
      { name: 'itemVariable', label: 'Item Variable Name', type: 'text', required: true, placeholder: 'currentItem' }
    ]
  },
  {
    type: 'delay',
    label: 'Delay',
    description: 'Waits for a specific time',
    icon: Clock,
    color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    defaultConfig: { delayMs: 1000 },
    configFields: [
      { name: 'delayMs', label: 'Wait Duration', type: 'delayBuilder' }
    ]
  }
];

export const getNodeDef = (type: string) => SUPPORTED_NODES.find(n => n.type === type);
