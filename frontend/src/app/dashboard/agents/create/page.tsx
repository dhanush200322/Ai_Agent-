'use client';

import React from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { CreateAgentForm } from '@/features/agents/components/forms/CreateAgentForm';

export default function CreateAgentPage() {
  return (
    <ContentWrapper>
      <div className="mb-8">
        <PageHeader 
          title="Create AI Agent"
          description="Deploy a new autonomous agent by configuring its identity, capabilities, and instructions."
        />
      </div>

      <CreateAgentForm />
    </ContentWrapper>
  );
}
