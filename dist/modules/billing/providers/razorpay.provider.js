"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayProvider = void 0;
// Note: Stubbed implementation. Add actual razorpay sdk.
class RazorpayProvider {
    async createCustomer(email, _name) {
        return { id: `rzp_cust_${Date.now()}`, email };
    }
    async createCheckout(_customerId, priceId, _successUrl, _cancelUrl) {
        return { id: `rzp_checkout_${Date.now()}`, url: `https://razorpay.com/checkout/${priceId}` };
    }
    async processPayment(_amount, _currency, _source) {
        return `rzp_pay_${Date.now()}`;
    }
    async refund(_paymentId, _amount) {
        return true;
    }
    verifyWebhook(payload, _signature, _secret) {
        // Implement crypto.createHmac verification here
        return JSON.parse(payload);
    }
}
exports.RazorpayProvider = RazorpayProvider;
