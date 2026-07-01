import React, { useState, useEffect } from 'react';
import { Palette, Monitor, Moon, Sun, Check, Sparkles } from 'lucide-react';
import { AppearanceSettings as AppearanceConfig } from '../types/settings';

const DEFAULT_SETTINGS: AppearanceConfig = {
  theme: 'dark',
  accentColor: '#D4AF37',
  compactMode: false,
  sidebarDensity: 'comfortable',
  glassmorphism: true,
};

const ACCENT_COLORS = [
  { name: 'Gold', value: '#D4AF37' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
];

export function AppearanceSettings() {
  const [settings, setSettings] = useState<AppearanceConfig>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('appearance_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {}
    }
  }, []);

  const updateSetting = <K extends keyof AppearanceConfig>(key: K, value: AppearanceConfig[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('appearance_settings', JSON.stringify(newSettings));
    
    // Show saved indicator briefly
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // In a real app, this might dispatch an event or update a global store/context 
    // to instantly apply changes across the app.
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Theme Selection */}
      <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#D4AF37]" /> Interface Theme
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThemeCard 
            title="Light" 
            icon={Sun} 
            active={settings.theme === 'light'} 
            onClick={() => updateSetting('theme', 'light')} 
          />
          <ThemeCard 
            title="Dark" 
            icon={Moon} 
            active={settings.theme === 'dark'} 
            onClick={() => updateSetting('theme', 'dark')} 
          />
          <ThemeCard 
            title="System" 
            icon={Monitor} 
            active={settings.theme === 'system'} 
            onClick={() => updateSetting('theme', 'system')} 
          />
        </div>
      </div>

      {/* Accent Color */}
      <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-medium text-white mb-6">Accent Color</h3>
        <div className="flex flex-wrap gap-4">
          {ACCENT_COLORS.map(color => (
            <button
              key={color.value}
              onClick={() => updateSetting('accentColor', color.value)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${settings.accentColor === color.value ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : 'hover:scale-110'}`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {settings.accentColor === color.value && <Check className="w-5 h-5 text-white/90 drop-shadow-md" />}
            </button>
          ))}
        </div>
      </div>

      {/* UI Preferences */}
      <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-6">
          <ToggleRow 
            title="Glassmorphism"
            description="Enable translucent, blurred backgrounds across the interface."
            icon={Sparkles}
            enabled={settings.glassmorphism}
            onToggle={() => updateSetting('glassmorphism', !settings.glassmorphism)}
          />
          <div className="h-px bg-zinc-800" />
          <ToggleRow 
            title="Compact Mode"
            description="Reduce padding and margins to fit more content on screen."
            enabled={settings.compactMode}
            onToggle={() => updateSetting('compactMode', !settings.compactMode)}
          />
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-8 right-8 bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-4 h-4" /> Preferences saved
        </div>
      )}
    </div>
  );
}

function ThemeCard({ title, icon: Icon, active, onClick }: { title: string, icon: any, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        p-4 rounded-xl border flex flex-col items-center gap-3 transition-all
        ${active ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}
      `}
    >
      <div className={`p-3 rounded-full ${active ? 'bg-[#D4AF37]/20' : 'bg-zinc-800'}`}>
        <Icon className={`w-6 h-6 ${active ? 'text-[#D4AF37]' : 'text-zinc-400'}`} />
      </div>
      <span className={`font-medium ${active ? 'text-white' : 'text-zinc-400'}`}>{title}</span>
    </button>
  );
}

function ToggleRow({ title, description, icon: Icon, enabled, onToggle }: { title: string, description: string, icon?: any, enabled: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg mt-1">
            <Icon className="w-5 h-5 text-[#D4AF37]" />
          </div>
        )}
        <div>
          <h4 className="text-white font-medium mb-1">{title}</h4>
          <p className="text-zinc-500 text-sm">{description}</p>
        </div>
      </div>
      <button 
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-[#D4AF37]' : 'bg-zinc-700'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
