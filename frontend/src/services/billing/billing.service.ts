import { useQuery } from '@tanstack/react-query';
import { api } from '../api/api';

export interface Subscription {
  id: string;
  planId: string;
  status: string;
  billingCycle: string;
  startDate: string;
  expiryDate?: string;
  renewalDate?: string;
  amount?: number;
  currency?: string;
  plan?: {
    id: string;
    name: string;
  };
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  purchaseDate: string;
  paymentMethod: string;
  provider: string;
  orderId: string;
  invoice: {
    invoiceNumber: string;
  };
}

export const billingKeys = {
  all: ['billing'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  history: () => [...billingKeys.all, 'history'] as const,
};

export const useSubscription = () => {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: async (): Promise<Subscription> => {
      const response = await api.get('/billing/subscription');
      return response.data;
    },
  });
};

export const usePaymentHistory = () => {
  return useQuery({
    queryKey: billingKeys.history(),
    queryFn: async (): Promise<PaymentHistoryItem[]> => {
      const response = await api.get('/billing/payment-history');
      return response.data;
    },
  });
};
