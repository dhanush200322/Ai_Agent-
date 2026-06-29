"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "Perfect for exploring and building your first AI agents.",
    features: ["Up to 3 AI Agents", "10,000 Queries / mo", "Basic RAG Support", "Community Support"],
    popular: false,
    buttonVariant: "secondary" as const,
  },
  {
    name: "Professional",
    price: "$199",
    period: "/mo",
    description: "For teams scaling their AI workflows in production.",
    features: ["Unlimited AI Agents", "100,000 Queries / mo", "Advanced RAG & Vector DB", "Priority Support", "Custom Tool Integrations"],
    popular: true,
    buttonVariant: "primary" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Dedicated infrastructure and ultimate security for scale.",
    features: ["Unlimited Everything", "Dedicated Edge Nodes", "SOC2 / HIPAA Compliance", "24/7 SLA Support", "On-Premises Option"],
    popular: false,
    buttonVariant: "secondary" as const,
  },
];

export function PricingCards() {
  return (
    <section className="py-32 px-8 md:px-16 lg:px-24 bg-[#0B0B0B] relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Transparent Pricing</h2>
          <p className="text-[#B7B7B7] max-w-2xl mx-auto text-lg">
            Scale your agents without worrying about hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className={`relative bg-[#050505] border rounded-3xl p-8 flex flex-col h-full ${
                plan.popular 
                  ? "border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)] md:-translate-y-4" 
                  : "border-[rgba(255,255,255,0.05)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#D4AF37] to-[#F7D774] text-[#050505] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-[#B7B7B7] text-sm h-10">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-end gap-1">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                <span className="text-[#B7B7B7] font-medium mb-1">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-[rgba(212,175,55,0.1)] rounded-full p-0.5">
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <span className="text-white/90 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <MagneticButton variant={plan.buttonVariant} className="w-full">
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </MagneticButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
