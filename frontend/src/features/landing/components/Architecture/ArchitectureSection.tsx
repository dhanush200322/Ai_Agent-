"use client";

import { motion } from "framer-motion";
import { Monitor, Server, Database, Brain, ArrowRight } from "lucide-react";

const nodes = [
  { id: "frontend", label: "Frontend", icon: Monitor, color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10", border: "border-[#0EA5E9]/30" },
  { id: "gateway", label: "API Gateway", icon: Server, color: "text-[#4F8CFF]", bg: "bg-[#4F8CFF]/10", border: "border-[#4F8CFF]/30" },
  { id: "backend", label: "Core Backend", icon: Server, color: "text-[#6366F1]", bg: "bg-[#6366F1]/10", border: "border-[#6366F1]/30" },
  { id: "db", label: "PostgreSQL & Redis", icon: Database, color: "text-[#4F8CFF]", bg: "bg-[#4F8CFF]/10", border: "border-[#4F8CFF]/30" },
  { id: "vector", label: "Qdrant Vector DB", icon: Database, color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10", border: "border-[#0EA5E9]/30" },
  { id: "llm", label: "LLM Engine", icon: Brain, color: "text-[#6366F1]", bg: "bg-[#6366F1]/10", border: "border-[#6366F1]/30" },
];

export const ArchitectureSection = () => {
  return (
    <section className="py-32 relative bg-[#04070D] border-t border-white/[0.05] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(79,140,255,0.08)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white"
          >
            Platform Architecture
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-sans text-xl text-white/50 max-w-2xl mx-auto font-light"
          >
            Secure, scalable, and built for the enterprise.
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-6 md:gap-10 relative z-10">
            {nodes.map((node, i) => (
              <div key={node.id} className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                  className={`w-44 h-44 rounded-3xl border ${node.border} ${node.bg} backdrop-blur-xl flex flex-col items-center justify-center p-6 relative group shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all cursor-default`}
                >
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <node.icon className={`w-12 h-12 mb-5 ${node.color} group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_currentColor]`} />
                  <span className="font-sans text-sm font-bold text-center text-white tracking-wide">{node.label}</span>
                </motion.div>
                
                {i < nodes.length - 1 && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    whileInView={{ opacity: 1, width: "auto" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (i * 0.15) + 0.1 }}
                    className="hidden lg:flex items-center justify-center w-12 text-white/20"
                  >
                    <ArrowRight className="w-8 h-8 animate-pulse text-[#4F8CFF]" />
                  </motion.div>
                )}
                
                {/* Mobile downward arrow */}
                {i < nodes.length - 1 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (i * 0.15) + 0.1 }}
                    className="flex lg:hidden items-center justify-center h-8 text-white/20"
                  >
                    <ArrowRight className="w-6 h-6 animate-pulse text-[#4F8CFF] rotate-90" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
