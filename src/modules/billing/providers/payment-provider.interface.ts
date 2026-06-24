export interface PaymentCustomer {
  id: string;
  email: string;
}

export interface PaymentCheckout {
  id: string;
  url: string;
}

export interface PaymentProvider {
  createCustomer(email: string, name?: string): Promise<PaymentCustomer>;
  createCheckout(customerId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<PaymentCheckout>;
  processPayment(amount: number, currency: string, source: string): Promise<string>;
  refund(paymentId: string, amount?: number): Promise<boolean>;
  verifyWebhook(payload: string, signature: string, secret: string): any;
}
