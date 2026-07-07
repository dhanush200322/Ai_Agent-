'use client';

import React from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { ContactForm } from '@/features/landing/components/sections/ContactForm';

export default function SupportPage() {
  return (
    <ContentWrapper>
      <PageHeader 
        title="Help & Support"
        description="Get help or contact our support team."
      />
      <div className="mt-8">
        <ContactForm />
      </div>
    </ContentWrapper>
  );
}
