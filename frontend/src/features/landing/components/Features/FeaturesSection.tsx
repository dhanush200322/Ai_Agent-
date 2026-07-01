"use client";

import { motion } from "framer-motion";
import { Wrench, Library, Brain, GitMerge, FileSearch, Network, ShoppingBag, BarChart3, Mic, Cloud } from "lucide-react";

const features = [
  { title: "AI Agent Builder", icon: Wrench, desc: "Visual drag-and-drop builder for custom agents." },
  { title: "Knowledge Hub", icon: Library, desc: "Centralized repository for all enterprise documents." },
  { title: "Memory Engine", icon: Brain, desc: "Long-term and short-term semantic memory." },
  { title: "Workflow Builder", icon: GitMerge, desc: "Connect agents to existing business logic." },
  { title: "RAG Engine", icon: FileSearch, desc: "Advanced vector search and retrieval generation." },
  { title: "Multi-Agent System", icon: Network, desc: "Swarm intelligence with agent-to-agent communication." },
  { title: "Marketplace", icon: ShoppingBag, desc: "Pre-built templates and enterprise integrations." },
  { title: "Analytics", icon: BarChart3, desc: "Real-time insights into agent performance and costs." },
  { title: "Voice AI", icon: Mic, desc: "Real-time speech-to-text and text-to-speech." },
  { title: "Deploy Anywhere", icon: Cloud, desc: "VPC, On-Premise, or fully managed cloud." },
];

export const FeaturesSection = () => {
  return (
    <section className="py-32 relative bg-[#04070D] overflow-hidden" id="product">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-[#6366F1]/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-md">
              Nexora AI
            </h2>
            <p className="font-sans text-xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
              Everything you need to build, deploy, and manage production-grade AI agents at scale.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:border-[#4F8CFF]/50 transition-all duration-300 backdrop-blur-xl group shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_40px_rgba(79,140,255,0.15)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#4F8CFF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F8CFF]/20 to-[#6366F1]/20 border border-white/10 flex items-center justify-center mb-6 text-[#0EA5E9] group-hover:text-white group-hover:scale-110 transition-all duration-500 relative z-10">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold mb-3 text-white tracking-tight relative z-10">{feat.title}</h3>
              <p className="font-sans text-sm text-white/50 leading-relaxed relative z-10 font-light">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
