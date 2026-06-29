"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

const plans = [
  {
    name: "Starter",
    price: "$499",
    desc: "For small teams building their first agents.",
    features: ["Up to 5 Agents", "100k LLM Tokens/mo", "Community Support", "Basic Analytics"],
    popular: false,
  },
  {
    name: "Professional",
    price: "$1,499",
    desc: "For growing organizations scaling AI.",
    features: ["Up to 20 Agents", "1M LLM Tokens/mo", "Priority Support", "Advanced Analytics", "Custom Integrations"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For large scale deployments.",
    features: ["Unlimited Agents", "Unlimited Tokens", "Dedicated Success Manager", "On-Prem / VPC Deployment", "SLA Guarantee", "White-labeling"],
    popular: false,
  }
];

export const PricingSection = () => {
  return (
    <section className="py-32 relative bg-[#04070D] border-t border-white/[0.05] overflow-hidden" id="pricing">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(6,214,255,0.05)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(159,92,255,0.05)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white"
          >
            Transparent pricing for scale
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans text-xl text-white/50 max-w-2xl mx-auto font-light"
          >
            Start small, scale infinitely. No hidden fees.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`p-10 rounded-[2rem] relative bg-white/[0.02] backdrop-blur-2xl border transition-all duration-300 group overflow-hidden ${plan.popular ? 'border-[#4F8CFF]/50 shadow-[0_0_50px_rgba(79,140,255,0.15)]' : 'border-white/[0.08] hover:border-white/[0.15]'}`}
            >
              {plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F8CFF]/[0.05] to-transparent pointer-events-none" />
              )}
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#4F8CFF] to-transparent" />
              )}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-[#4F8CFF] to-[#6366F1] text-white text-xs font-bold uppercase tracking-[0.15em] rounded-full shadow-[0_0_20px_rgba(79,140,255,0.5)]">
                  Most Popular
                </div>
              )}
              
              <h3 className="font-heading text-2xl font-bold mb-3 text-white">{plan.name}</h3>
              <p className="font-sans text-white/50 mb-8 font-light h-12">{plan.desc}</p>
              
              <div className="mb-10 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white tracking-tighter">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-white/40 font-medium tracking-wide">/mo</span>}
              </div>
              
              <MagneticButton className="w-full mb-10 block">
                <button className={`w-full py-4 rounded-2xl font-bold transition-all relative overflow-hidden group/btn ${plan.popular ? 'bg-white text-[#04070D] hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/[0.08]'}`}>
                  <span className="relative z-10">{plan.price === "Custom" ? "Contact Sales" : "Get Started"}</span>
                  {plan.popular && <div className="absolute inset-0 bg-gradient-to-r from-[#4F8CFF]/10 to-[#6366F1]/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />}
                </button>
              </MagneticButton>
              
              <ul className="space-y-5 relative z-10">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-4 text-white/70 font-light">
                    <div className="w-6 h-6 rounded-full bg-[#4F8CFF]/20 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#4F8CFF]" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
