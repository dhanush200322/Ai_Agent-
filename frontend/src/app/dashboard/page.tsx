'use client';

import React from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { DashboardCard } from '@/components/dashboard/ui/DashboardCard';
import { LoadingSkeleton } from '@/components/dashboard/ui/LoadingSkeleton';
import { Bot, Activity, Users, CreditCard } from 'lucide-react';

export default function DashboardOverviewPage() {
  return (
    <ContentWrapper>
      <PageHeader 
        title="Dashboard Overview"
        description="Welcome back. Here's a summary of your organization's AI Agent activity."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardCard variant="metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Active Agents</p>
              <h4 className="text-3xl font-bold text-white mt-2">12</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-400 font-medium">+3</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </DashboardCard>

        <DashboardCard variant="metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Workflows Run</p>
              <h4 className="text-3xl font-bold text-white mt-2">1,284</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-400 font-medium">+12.5%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </DashboardCard>

        <DashboardCard variant="metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Users</p>
              <h4 className="text-3xl font-bold text-white mt-2">48</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <Users className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-400 font-medium">+5</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </DashboardCard>

        <DashboardCard variant="metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">API Usage</p>
              <h4 className="text-3xl font-bold text-white mt-2">$342.50</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-400 font-medium">-$12.40</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="Recent Activity" 
          subtitle="Your organization's latest events"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <LoadingSkeleton variant="table-row" />
            <LoadingSkeleton variant="table-row" />
            <LoadingSkeleton variant="table-row" />
            <LoadingSkeleton variant="table-row" />
          </div>
        </DashboardCard>

        <DashboardCard 
          title="System Status" 
          subtitle="All systems operational"
        >
          <div className="space-y-4">
            <LoadingSkeleton variant="card" />
          </div>
        </DashboardCard>
      </div>
    </ContentWrapper>
  );
}
