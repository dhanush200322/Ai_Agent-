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
              <p className="text-zinc-400">No active subscription found.</p>
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
              <p className="text-zinc-400">No payment history available.</p>
            )}
          </CardContent>
        </Card>

      </div>
    </ContentWrapper>
  );
}
