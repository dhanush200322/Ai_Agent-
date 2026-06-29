"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Brain, Workflow, Network, Globe } from "lucide-react";

const features = [
  {
    title: "Enterprise Ready",
    description: "Built for scale with SOC2 compliance, role-based access control, and dedicated infrastructure.",
    icon: <Shield className="w-6 h-6 text-[#D4AF37]" />,
    colSpan: "md:col-span-2",
  },
  {
    title: "Multi-Agent Orchestration",
    description: "Deploy swarms of specialized agents working in tandem.",
    icon: <Network className="w-6 h-6 text-[#D4AF37]" />,
    colSpan: "md:col-span-1",
  },
  {
    title: "RAG Powered",
    description: "Connect your enterprise knowledge base seamlessly.",
    icon: <Brain className="w-6 h-6 text-[#D4AF37]" />,
    colSpan: "md:col-span-1",
  },
  {
    title: "Automated Workflows",
    description: "Trigger complex multi-step tasks natively.",
    icon: <Workflow className="w-6 h-6 text-[#D4AF37]" />,
    colSpan: "md:col-span-1",
  },
  {
    title: "Low Latency Edge",
    description: "Global edge network ensures <50ms response times.",
    icon: <Zap className="w-6 h-6 text-[#D4AF37]" />,
    colSpan: "md:col-span-1",
  },
];

export function FeaturesBento() {
  return (
    <section className="py-32 px-8 md:px-16 lg:px-24 bg-[#0B0B0B] relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Enterprise Grade AI</h2>
          <p className="text-[#B7B7B7] max-w-2xl mx-auto text-lg">
            Everything you need to build, deploy, and scale autonomous AI agents securely in a production environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`bg-[rgba(255,255,255,0.02)] border border-[rgba(212,175,55,0.1)] rounded-3xl p-8 hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(212,175,55,0.3)] transition-all ${feature.colSpan} relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                {feature.icon}
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#050505] border border-[rgba(212,175,55,0.2)] flex items-center justify-center mb-6 relative z-10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
              <p className="text-[#B7B7B7] relative z-10">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
