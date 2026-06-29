"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const cases = [
  {
    title: "Customer Support Automation",
    category: "Support",
    desc: "Resolve 80% of L1/L2 tickets instantly using RAG over your internal Confluence and Zendesk docs.",
    image: "bg-gradient-to-br from-blue-900 to-black"
  },
  {
    title: "Financial Data Analysis",
    category: "Finance",
    desc: "Aggregate market data, process SEC filings, and generate compliance reports automatically.",
    image: "bg-gradient-to-br from-purple-900 to-black"
  },
  {
    title: "Code Review & Refactoring",
    category: "Engineering",
    desc: "Automated PR reviews, security vulnerability scanning, and legacy code modernization.",
    image: "bg-gradient-to-br from-emerald-900 to-black"
  }
];

export const UseCasesSection = () => {
  return (
    <section className="py-24 relative bg-background border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Built for <span className="text-primary">Impact.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              See how the world's best companies are leveraging AgentOS.
            </p>
          </div>
          <button className="text-white hover:text-primary transition-colors flex items-center gap-2 font-semibold">
            View all case studies <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="rounded-3xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer"
            >
              <div className={`h-48 w-full ${c.image} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-white">
                  {c.category}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
