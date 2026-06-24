import Stripe from 'stripe';
import { PaymentProvider, PaymentCustomer, PaymentCheckout } from './payment-provider.interface';

export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123');
  }

  async createCustomer(email: string, name?: string): Promise<PaymentCustomer> {
    const customer = await this.stripe.customers.create({ email, name });
    return { id: customer.id, email: customer.email as string };
  }

  async createCheckout(customerId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<PaymentCheckout> {
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return { id: session.id, url: session.url as string };
  }

  async processPayment(amount: number, currency: string, source: string): Promise<string> {
    const charge = await this.stripe.charges.create({
      amount: Math.round(amount * 100), // convert to cents
      currency,
      source,
    });
    return charge.id;
  }

  async refund(paymentId: string, amount?: number): Promise<boolean> {
    const params: Stripe.RefundCreateParams = { charge: paymentId };
    if (amount) {
      params.amount = Math.round(amount * 100);
    }
    const refund = await this.stripe.refunds.create(params);
    return refund.status === 'succeeded';
  }

  verifyWebhook(payload: string, signature: string, secret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
