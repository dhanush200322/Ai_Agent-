'use client';

import React from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { DashboardCard } from '@/components/dashboard/ui/DashboardCard';
import { LoadingSkeleton } from '@/components/dashboard/ui/LoadingSkeleton';
import { Bot, Activity, Users, CreditCard } from 'lucide-react';
import { useOrganizationStats, useOrganizationActivity } from '@/services/organization/organization.service';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardOverviewPage() {
  const { data: stats, isLoading: isStatsLoading } = useOrganizationStats();
  const { data: activities, isLoading: isActivitiesLoading } = useOrganizationActivity();

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
              <h4 className="text-3xl font-bold text-white mt-2">
                {isStatsLoading ? <span className="animate-pulse bg-zinc-800 rounded w-12 h-8 inline-block"></span> : stats?.activeAgents || 0}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Live agents running</span>
          </div>
        </DashboardCard>

        <DashboardCard variant="metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Workflows Run</p>
              <h4 className="text-3xl font-bold text-white mt-2">
                {isStatsLoading ? <span className="animate-pulse bg-zinc-800 rounded w-16 h-8 inline-block"></span> : stats?.workflowsRun?.toLocaleString() || 0}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Total automated workflows executed</span>
          </div>
        </DashboardCard>

        <DashboardCard variant="metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Users</p>
              <h4 className="text-3xl font-bold text-white mt-2">
                {isStatsLoading ? <span className="animate-pulse bg-zinc-800 rounded w-12 h-8 inline-block"></span> : stats?.totalUsers || 0}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <Users className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Users in this workspace</span>
          </div>
        </DashboardCard>

        <DashboardCard variant="metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">API Usage</p>
              <h4 className="text-3xl font-bold text-white mt-2">
                {isStatsLoading ? <span className="animate-pulse bg-zinc-800 rounded w-20 h-8 inline-block"></span> : `$${(stats?.apiUsageCost || 0).toFixed(2)}`}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Current billing cycle</span>
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
            {isActivitiesLoading ? (
              <>
                <LoadingSkeleton variant="table-row" />
                <LoadingSkeleton variant="table-row" />
                <LoadingSkeleton variant="table-row" />
              </>
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.details || 'System event'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">No recent activity found.</p>
              </div>
            )}
          </div>
        </DashboardCard>

        <DashboardCard 
          title="System Status" 
          subtitle="All systems operational"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">Agent Engine</p>
                <p className="text-xs text-green-400">Online • 99.9% Uptime</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">Knowledge Base</p>
                <p className="text-xs text-green-400">Online • Fully Synced</p>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </ContentWrapper>
  );
}
