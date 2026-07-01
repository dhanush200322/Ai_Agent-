import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, Building2, User, Shield, Key, Bell, Palette, 
  Brain, Database, GitMerge, Rocket, Webhook, CreditCard, 
  Activity, Info, Search, ChevronRight
} from 'lucide-react';
import { SettingsSection } from '../types/settings';

interface SettingsLayoutProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  children: React.ReactNode;
}

const SETTINGS_SECTIONS = [
  {
    title: 'General',
    items: [
      { id: 'general', label: 'General', icon: Settings2 },
      { id: 'organization', label: 'Organization', icon: Building2 },
      { id: 'profile', label: 'Profile', icon: User },
    ]
  },
  {
    title: 'Security & Access',
    items: [
      { id: 'security', label: 'Security', icon: Shield },
      { id: 'authentication', label: 'Authentication', icon: Key },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'appearance', label: 'Appearance', icon: Palette },
    ]
  },
  {
    title: 'Platform Config',
    items: [
      { id: 'ai-settings', label: 'AI Settings', icon: Brain },
      { id: 'knowledge', label: 'Knowledge', icon: Database },
      { id: 'workflow', label: 'Workflow', icon: GitMerge },
      { id: 'deployment', label: 'Deployment', icon: Rocket },
    ]
  },
  {
    title: 'Developer',
    items: [
      { id: 'api-keys', label: 'API Keys', icon: Key },
      { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'billing', label: 'Billing', icon: CreditCard },
      { id: 'audit-logs', label: 'Audit Logs', icon: Activity },
      { id: 'about', label: 'About', icon: Info },
    ]
  }
];

export function SettingsLayout({ activeSection, onSectionChange, children }: SettingsLayoutProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSections = SETTINGS_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Settings Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {filteredSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.items.map(item => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onSectionChange(item.id as SettingsSection)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-left group relative
                          ${isActive ? 'text-[#D4AF37]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}
                        `}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="active-setting"
                            className="absolute inset-0 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {filteredSections.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No settings found.
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
