'use client';

import React from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { Bot, Database, MessageSquare, GitMerge, Store, Lock, Building2, Users, Shield, CreditCard, Activity, Settings } from 'lucide-react';

export default function UsersPage() {
  const getIcon = () => {
    const routeName: string = 'users';
    switch (routeName) {
      case 'agents': return Bot;
      case 'knowledge': return Database;
      case 'chat': return MessageSquare;
      case 'workflows': return GitMerge;
      case 'marketplace': return Store;
      case 'vault': return Lock;
      case 'organization': return Building2;
      case 'users': return Users;
      case 'roles': return Shield;
      case 'billing': return CreditCard;
      case 'observability': return Activity;
      case 'settings': return Settings;
      default: return Bot;
    }
  };

  return (
    <ContentWrapper>
      <PageHeader 
        title="Users"
        description="Manage your enterprise users here."
      />
      <EmptyState 
        icon={getIcon()}
        title="Coming Soon"
        description="The users module will be implemented in Phase 3."
      />
    </ContentWrapper>
  );
}
