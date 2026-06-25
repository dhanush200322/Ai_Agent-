"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeProvider = void 0;
const stripe_1 = __importDefault(require("stripe"));
class StripeProvider {
    stripe;
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_123');
    }
    async createCustomer(email, name) {
        const customer = await this.stripe.customers.create({ email, name });
        return { id: customer.id, email: customer.email };
    }
    async createCheckout(customerId, priceId, successUrl, cancelUrl) {
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
        return { id: session.id, url: session.url };
    }
    async processPayment(amount, currency, source) {
        const charge = await this.stripe.charges.create({
            amount: Math.round(amount * 100), // convert to cents
            currency,
            source,
        });
        return charge.id;
    }
    async refund(paymentId, amount) {
        const params = { charge: paymentId };
        if (amount) {
            params.amount = Math.round(amount * 100);
        }
        const refund = await this.stripe.refunds.create(params);
        return refund.status === 'succeeded';
    }
    verifyWebhook(payload, signature, secret) {
        return this.stripe.webhooks.constructEvent(payload, signature, secret);
    }
}
exports.StripeProvider = StripeProvider;
