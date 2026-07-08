"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useRouter } from "next/navigation";
import { api } from "@/services/api/api";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store";
const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "Forever",
    badge: "Perfect for Individuals",
    description: "Start for free. Scale as your AI workspace grows.",
    features: [
      "1 Workspace",
      "1 AI Agent",
      "1 Knowledge Base",
      "20 Documents",
      "Website Chat Widget",
      "Basic RAG Search",
      "500 AI Messages / Month",
      "Basic Workflow Builder",
      "Community Support"
    ],
    buttonText: "Start Free",
    popular: false,
    buttonVariant: "secondary" as const,
  },
  {
    name: "Professional",
    priceMonthly: "₹999",
    priceAnnual: "₹9,990",
    periodMonthly: "/ month",
    periodAnnual: "/ year",
    badge: "Most Popular",
    description: "For teams scaling their AI workflows in production.",
    features: [
      "Unlimited AI Agents",
      "Unlimited Knowledge Bases",
      "5,000 Documents",
      "Website & API Deployment",
      "Advanced RAG",
      "Workflow Automation",
      "AI Chat",
      "Secrets Vault",
      "Observability Dashboard",
      "Team Collaboration",
      "Role-Based Access Control (RBAC)",
      "100,000 AI Messages / Month",
      "Priority Email Support"
    ],
    buttonText: "Upgrade to Pro",
    popular: true,
    buttonVariant: "primary" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Pricing",
    badge: "",
    description: "Dedicated infrastructure and ultimate security for scale.",
    features: [
      "Unlimited Everything",
      "Unlimited Organizations",
      "Unlimited Team Members",
      "Unlimited AI Messages",
      "Dedicated Infrastructure",
      "On-Premise Deployment",
      "SSO & SAML",
      "White Label",
      "Custom Integrations",
      "Enterprise SLA",
      "Dedicated Account Manager",
      "Premium Support (24×7)"
    ],
    buttonText: "Contact Sales",
    popular: false,
    buttonVariant: "secondary" as const,
  },
];

const featuresList = [
  { name: "AI Agents", starter: "1", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Knowledge Bases", starter: "1", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Documents", starter: "20", pro: "5,000", enterprise: "Unlimited" },
  { name: "Website Widget", starter: true, pro: true, enterprise: true },
  { name: "Workflow Builder", starter: "Basic", pro: "Advanced", enterprise: "Unlimited" },
  { name: "RAG Chat", starter: "Basic", pro: "Advanced", enterprise: "Enterprise" },
  { name: "API Access", starter: false, pro: true, enterprise: true },
  { name: "Secrets Vault", starter: false, pro: true, enterprise: true },
  { name: "Observability", starter: false, pro: true, enterprise: true },
  { name: "Team Members", starter: "1", pro: "20", enterprise: "Unlimited" },
  { name: "RBAC", starter: false, pro: true, enterprise: true },
  { name: "White Label", starter: false, pro: false, enterprise: true },
  { name: "On-Premise", starter: false, pro: false, enterprise: true },
  { name: "SLA", starter: false, pro: false, enterprise: true },
  { name: "Support", starter: "Community", pro: "Priority", enterprise: "24×7 Dedicated" },
];

interface PricingCardsProps {
  showCTA?: boolean;
}

export function PricingCards({ showCTA = true }: PricingCardsProps = {}) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planName: string) => {
    // If showCTA is true, we're likely on the landing page where user isn't logged in
    if (showCTA) {
      return router.push('/login');
    }

    if (planName.toLowerCase() !== 'professional') {
      // Free or Enterprise
      return;
    }

    try {
      setIsProcessing(true);
      
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      const billingCycle = isAnnual ? 'annual' : 'monthly';

      // 1. Create order on backend
      const orderRes = await api.post('/billing/create-razorpay-order', {
        plan: 'professional',
        billingCycle
      });

      const { order_id, amount, currency } = orderRes.data;

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: amount.toString(),
        currency: currency,
        name: "Nexora AI",
        description: `Upgrade to Professional (${billingCycle})`,
        order_id: order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on backend
            await api.post('/billing/verify-razorpay-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: 'professional',
              billingCycle
            });

            // Refresh user session after payment
            const userRes = await api.get('/auth/me');
            useAuthStore.getState().setUser(userRes.data.data);

            toast.success("Successfully upgraded to Professional plan!");
            router.refresh(); // Refresh the page to reflect new subscription status
          } catch (error) {
            console.error("Payment verification failed", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        theme: {
          color: "#D4AF37"
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      
      rzp1.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      
      rzp1.open();
    } catch (error) {
      console.error("Failed to initiate payment", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="py-32 px-8 md:px-16 lg:px-24 bg-[#0B0B0B] relative overflow-hidden" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-[#B7B7B7] max-w-2xl mx-auto text-lg mb-8">
            Start for free. Scale as your AI workspace grows.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-zinc-400'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-8 bg-zinc-800 rounded-full p-1 transition-colors hover:bg-zinc-700"
            >
              <div 
                className={`w-6 h-6 bg-[#D4AF37] rounded-full transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`} 
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-zinc-400'}`}>Annual</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">Save 20%</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className={`relative bg-[#050505] border rounded-3xl p-8 flex flex-col h-full ${
                plan.popular 
                  ? "border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)] md:-translate-y-4" 
                  : "border-[rgba(255,255,255,0.05)]"
              }`}
            >
              {plan.badge && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap ${
                  plan.popular ? "bg-gradient-to-r from-[#D4AF37] to-[#F7D774] text-[#050505]" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {plan.badge}
                </div>
              )}
              
              <div className="mb-6 mt-4">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              </div>

              <div className="mb-8 flex flex-col justify-start h-20">
                <div className="flex items-end gap-1">
                  <span className="text-4xl lg:text-5xl font-bold text-white">
                    {plan.name === "Professional" ? (isAnnual ? plan.priceAnnual : plan.priceMonthly) : plan.price}
                  </span>
                </div>
                <span className="text-[#B7B7B7] font-medium mt-1">
                  {plan.name === "Professional" ? (isAnnual ? plan.periodAnnual : plan.periodMonthly) : plan.period}
                </span>
                {plan.name === "Professional" && isAnnual && (
                  <span className="text-emerald-400 text-sm font-medium mt-1">Save 20%</span>
                )}
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-[rgba(212,175,55,0.1)] rounded-full p-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <span className="text-white/90 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <MagneticButton 
                  variant={plan.buttonVariant} 
                  className="w-full" 
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={isProcessing && plan.name === "Professional"}
                >
                  {isProcessing && plan.name === "Professional" ? "Processing..." : plan.buttonText}
                </MagneticButton>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-16">
          <p className="text-zinc-500 text-sm">Need a custom deployment or higher limits? Contact our Enterprise team.</p>
        </div>

        {/* Feature Comparison */}
        <div className="mb-24">
          <h3 className="text-3xl font-bold text-white text-center mb-10">Compare Plans</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 border-b border-[rgba(255,255,255,0.1)] text-zinc-400 font-medium">Features</th>
                  <th className="p-4 border-b border-[rgba(255,255,255,0.1)] text-white font-semibold">Starter</th>
                  <th className="p-4 border-b border-[rgba(255,255,255,0.1)] text-[#D4AF37] font-semibold">Professional</th>
                  <th className="p-4 border-b border-[rgba(255,255,255,0.1)] text-white font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featuresList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="p-4 border-b border-[rgba(255,255,255,0.05)] text-sm text-zinc-300">{item.name}</td>
                    
                    <td className="p-4 border-b border-[rgba(255,255,255,0.05)] text-sm">
                      {typeof item.starter === 'boolean' 
                        ? (item.starter ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-zinc-600" />) 
                        : <span className="text-zinc-300">{item.starter}</span>}
                    </td>
                    
                    <td className="p-4 border-b border-[rgba(255,255,255,0.05)] text-sm">
                      {typeof item.pro === 'boolean' 
                        ? (item.pro ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-zinc-600" />) 
                        : <span className="text-[#D4AF37]">{item.pro}</span>}
                    </td>
                    
                    <td className="p-4 border-b border-[rgba(255,255,255,0.05)] text-sm">
                      {typeof item.enterprise === 'boolean' 
                        ? (item.enterprise ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-zinc-600" />) 
                        : <span className="text-zinc-300">{item.enterprise}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        {showCTA && (
          <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-[rgba(255,255,255,0.1)] rounded-[32px] p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4F8CFF]/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Start building your AI workspace today.</h3>
              <p className="text-zinc-400 mb-2 text-lg">No credit card required.</p>
              <p className="text-[#D4AF37] mb-8 font-medium">Create your first AI Agent in under 5 minutes.</p>
              
              <div className="flex justify-center w-full">
                <MagneticButton variant="primary" className="!px-8 !py-4 text-lg" onClick={() => router.push('/login')}>
                  Get Started Free
                </MagneticButton>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
