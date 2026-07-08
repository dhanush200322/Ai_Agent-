'use client';

import React from 'react';
import { ContentWrapper } from '@/components/dashboard/layout/ContentWrapper';
import { PageHeader } from '@/components/dashboard/layout/PageHeader';
import { PricingCards } from '@/features/landing/components/sections/PricingCards';
import { useSubscription, usePaymentHistory } from '@/services/billing/billing.service';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default function BillingPage() {
  const { data: subscription, isLoading: isSubLoading } = useSubscription();
  const { data: history, isLoading: isHistoryLoading } = usePaymentHistory();

  return (
    <ContentWrapper>
      <PageHeader 
        title="Billing"
        description="Manage your enterprise billing here."
      />
      <div className="mt-8 space-y-8">
        
        {/* Current Subscription Status */}
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-xl text-white">Current Subscription</CardTitle>
            <CardDescription className="text-zinc-400">View your current plan and renewal information.</CardDescription>
          </CardHeader>
          <CardContent>
            {isSubLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-800 rounded"></div>
                  </div>
                </div>
              </div>
            ) : subscription ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-zinc-400">Plan</p>
                  <p className="font-semibold text-lg">{subscription?.plan?.name || 'Starter'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Status</p>
                  <p className={`font-semibold text-lg ${subscription.status === 'ACTIVE' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {subscription.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Billing Cycle</p>
                  <p className="font-semibold text-lg capitalize">{subscription.billingCycle || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Expiry Date</p>
                  <p className="font-semibold text-lg">
                    {subscription.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                  <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Active Subscription</h3>
                <p className="text-zinc-400 max-w-md mb-6">
                  You are currently on the Free Starter plan. Upgrade to unlock unlimited agents, API access, and enterprise features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Upgrade Plan</h2>
          <PricingCards showCTA={false} />
        </div>

        {/* Payment History */}
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-xl text-white">Payment History</CardTitle>
            <CardDescription className="text-zinc-400">Your recent payments and invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            {isHistoryLoading ? (
              <p className="text-zinc-400">Loading history...</p>
            ) : history && history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-400">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Method</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-b border-zinc-800">
                        <td className="px-6 py-4">{new Date(item.purchaseDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{item.invoice?.invoiceNumber}</td>
                        <td className="px-6 py-4">{item.currency} {item.amount}</td>
                        <td className="px-6 py-4 capitalize">{item.paymentMethod || item.provider}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                  <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Payment History</h3>
                <p className="text-zinc-400 max-w-md">
                  When you subscribe or make a purchase, your invoices and payment history will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </ContentWrapper>
  );
}
