'use client';

import React from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { PricingCards } from '@/features/landing/components/sections/PricingCards';

export default function BillingPage() {


  return (
    <ContentWrapper>
      <PageHeader 
        title="Billing"
        description="Manage your enterprise billing here."
      />
      <div className="mt-8">
        <PricingCards showCTA={false} />
      </div>
    </ContentWrapper>
  );
}
