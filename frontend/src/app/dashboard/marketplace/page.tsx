'use client';

import React from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { FEATURE_FLAGS } from '@/config/features';
import { ComingSoon } from '@/components/dashboard/ComingSoon';
import { Store } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';

export default function MarketplacePage() {
  if (!FEATURE_FLAGS.marketplace) {
    return (
      <ContentWrapper>
        <ComingSoon title="Marketplace" />
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <PageHeader 
        title="Marketplace"
        description="Manage your enterprise marketplace here."
      />
      <EmptyState 
        icon={Store}
        title="Marketplace"
        description="Marketplace module will be populated soon."
      />
    </ContentWrapper>
  );
}
