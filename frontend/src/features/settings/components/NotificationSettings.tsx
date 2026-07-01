import React, { useState, useEffect } from 'react';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '../services/notification.service';
import { Bell, Mail, Monitor, ShieldAlert, GitMerge, Database, Loader2, Save } from 'lucide-react';

export function NotificationSettings() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  const [formData, setFormData] = useState({
    emailNotifications: true,
    workflowAlerts: true,
    knowledgeAlerts: true,
    securityAlerts: true,
  });

  useEffect(() => {
    if (prefs) {
      setFormData({
        emailNotifications: prefs.emailNotifications ?? true,
        workflowAlerts: prefs.workflowAlerts ?? true,
        knowledgeAlerts: prefs.knowledgeAlerts ?? true,
        securityAlerts: prefs.securityAlerts ?? true,
      });
    }
  }, [prefs]);

  if (isLoading) {
    return <div className="h-96 bg-zinc-900/50 animate-pulse rounded-xl border border-zinc-800" />;
  }

  const handleUpdate = () => {
    updateMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#D4AF37]" /> Notification Preferences
        </h3>
        
        <div className="space-y-6">
          <ToggleRow 
            title="Email Notifications"
            description="Receive daily summaries and important updates via email."
            icon={Mail}
            enabled={formData.emailNotifications}
            onToggle={() => setFormData({...formData, emailNotifications: !formData.emailNotifications})}
          />
          <div className="h-px bg-zinc-800" />
          <ToggleRow 
            title="Workflow Alerts"
            description="Get notified when a workflow fails or requires approval."
            icon={GitMerge}
            enabled={formData.workflowAlerts}
            onToggle={() => setFormData({...formData, workflowAlerts: !formData.workflowAlerts})}
          />
          <div className="h-px bg-zinc-800" />
          <ToggleRow 
            title="Knowledge Base Sync"
            description="Alerts when documents finish syncing or encounter errors."
            icon={Database}
            enabled={formData.knowledgeAlerts}
            onToggle={() => setFormData({...formData, knowledgeAlerts: !formData.knowledgeAlerts})}
          />
          <div className="h-px bg-zinc-800" />
          <ToggleRow 
            title="Security & Access"
            description="Crucial alerts for new logins, password changes, and permissions."
            icon={ShieldAlert}
            enabled={formData.securityAlerts}
            onToggle={() => setFormData({...formData, securityAlerts: !formData.securityAlerts})}
          />
        </div>

        <div className="pt-8 flex items-center gap-4">
          <button 
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F7D774] text-black px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Preferences
          </button>
          {updateMutation.isSuccess && <span className="text-emerald-400 text-sm">Preferences saved</span>}
          {updateMutation.isError && <span className="text-rose-400 text-sm">Failed to save preferences</span>}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ title, description, icon: Icon, enabled, onToggle }: { title: string, description: string, icon?: any, enabled: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg mt-1">
            <Icon className="w-5 h-5 text-zinc-400" />
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
