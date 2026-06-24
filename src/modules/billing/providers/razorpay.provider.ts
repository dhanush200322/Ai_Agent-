import { PaymentProvider, PaymentCustomer, PaymentCheckout } from './payment-provider.interface';

// Note: Stubbed implementation. Add actual razorpay sdk.
export class RazorpayProvider implements PaymentProvider {
  async createCustomer(email: string, _name?: string): Promise<PaymentCustomer> {
    return { id: `rzp_cust_${Date.now()}`, email };
  }

  async createCheckout(_customerId: string, priceId: string, _successUrl: string, _cancelUrl: string): Promise<PaymentCheckout> {
    return { id: `rzp_checkout_${Date.now()}`, url: `https://razorpay.com/checkout/${priceId}` };
  }

  async processPayment(_amount: number, _currency: string, _source: string): Promise<string> {
    return `rzp_pay_${Date.now()}`;
  }

  async refund(_paymentId: string, _amount?: number): Promise<boolean> {
    return true;
  }

  verifyWebhook(payload: string, _signature: string, _secret: string): any {
    // Implement crypto.createHmac verification here
    return JSON.parse(payload);
  }
}
