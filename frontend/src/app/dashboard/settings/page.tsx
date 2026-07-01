'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { SettingsSection } from '@/features/settings/types/settings';
import { SettingsLayout } from '@/features/settings/components/SettingsLayout';
import { ProfessionalPlaceholder } from '@/features/settings/components/Placeholders';
import { OrganizationSettings } from '@/features/settings/components/OrganizationSettings';
import { ProfileSettings } from '@/features/settings/components/ProfileSettings';
import { SecuritySettings } from '@/features/settings/components/SecuritySettings';
import { AppearanceSettings } from '@/features/settings/components/AppearanceSettings';
import { NotificationSettings } from '@/features/settings/components/NotificationSettings';
import { Brain, Database, GitMerge, Rocket, Webhook, CreditCard, Activity, Info, Key } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get('section') as SettingsSection) || 'general';
  
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);

  useEffect(() => {
    const section = searchParams.get('section') as SettingsSection;
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [searchParams, activeSection]);

  const handleSectionChange = (section: SettingsSection) => {
    setActiveSection(section);
    router.push(`/dashboard/settings?section=${section}`);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      // Supported Sections
      case 'general':
      case 'organization':
        return <OrganizationSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'security':
      case 'authentication':
        return <SecuritySettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
        
      // Unsupported / Placeholder Sections
      case 'ai-settings':
        return <ProfessionalPlaceholder title="AI Configuration" icon={Brain} />;
      case 'knowledge':
        return <ProfessionalPlaceholder title="Knowledge Engine Settings" icon={Database} />;
      case 'workflow':
        return <ProfessionalPlaceholder title="Workflow Engine Settings" icon={GitMerge} />;
      case 'deployment':
        return <ProfessionalPlaceholder title="Deployment Settings" icon={Rocket} />;
      case 'api-keys':
        return <ProfessionalPlaceholder title="API Keys" icon={Key} />;
      case 'webhooks':
        return <ProfessionalPlaceholder title="Webhooks" icon={Webhook} />;
      case 'billing':
        return (
          <ProfessionalPlaceholder 
            title="Enterprise Billing" 
            description="Billing module is currently unavailable. Backend configuration is required before billing can be enabled."
            icon={CreditCard} 
          />
        );
      case 'audit-logs':
        return <ProfessionalPlaceholder title="Audit Logs" icon={Activity} />;
      case 'about':
        return (
          <ProfessionalPlaceholder 
            title="About Platform" 
            description="Application Version: v1.0.0. Environment: Production. Valid License Required."
            icon={Info} 
          />
        );
      default:
        return <OrganizationSettings />;
    }
  };

  return (
    <ContentWrapper>
      <PageHeader 
        title="Settings Center"
        description="Manage your enterprise configuration, security, and preferences."
      />
      
      <SettingsLayout activeSection={activeSection} onSectionChange={handleSectionChange}>
        {renderActiveSection()}
      </SettingsLayout>
    </ContentWrapper>
  );
}
