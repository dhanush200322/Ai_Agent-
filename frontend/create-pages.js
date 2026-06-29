const fs = require('fs');
const path = require('path');
const routes = ['agents', 'knowledge', 'chat', 'workflows', 'marketplace', 'vault', 'organization', 'users', 'roles', 'billing', 'observability', 'settings'];

routes.forEach(route => {
  const dir = path.join('src', 'app', 'dashboard', route);
  
  const title = route.charAt(0).toUpperCase() + route.slice(1);
  
  const content = `'use client';

import React from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { Bot, Database, MessageSquare, GitMerge, Store, Lock, Building2, Users, Shield, CreditCard, Activity, Settings } from 'lucide-react';

export default function ${title}Page() {
  const getIcon = () => {
    const routeName: string = '${route}';
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
        title="${title}"
        description="Manage your enterprise ${route} here."
      />
      <EmptyState 
        icon={getIcon()}
        title="Coming Soon"
        description="The ${route} module will be implemented in Phase 3."
      />
    </ContentWrapper>
  );
}
`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
});
console.log('Fixed pages!');
