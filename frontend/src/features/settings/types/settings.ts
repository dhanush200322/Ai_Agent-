export type SettingsSection = 
  | 'general'
  | 'organization'
  | 'profile'
  | 'security'
  | 'authentication'
  | 'notifications'
  | 'appearance'
  | 'ai-settings'
  | 'knowledge'
  | 'workflow'
  | 'deployment'
  | 'api-keys'
  | 'webhooks'
  | 'billing'
  | 'audit-logs'
  | 'about';

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  compactMode: boolean;
  sidebarDensity: 'comfortable' | 'compact';
  glassmorphism: boolean;
}
