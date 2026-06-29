"use client";

import { motion } from "framer-motion";
import { Bot, Code, Database, Sparkles } from "lucide-react";

const agents = [
  { title: "DevOps Agent", icon: Code, desc: "Automates CI/CD pipelines and infrastructure scaling.", color: "from-[#4F8CFF]/20 to-[#0EA5E9]/20" },
  { title: "Data Analyst Agent", icon: Database, desc: "Query databases using natural language and generate reports.", color: "from-[#6366F1]/20 to-[#4F8CFF]/20" },
  { title: "Customer Success Agent", icon: Bot, desc: "Resolves tier 1 & 2 tickets using your knowledge base.", color: "from-[#0EA5E9]/20 to-[#4F8CFF]/20" },
  { title: "Research Agent", icon: Sparkles, desc: "Aggregates market data and generates competitive analysis.", color: "from-[#6366F1]/20 to-[#0EA5E9]/20" },
];

export const AgentShowcase = () => {
  return (
    <section className="py-32 relative bg-[#04070D] border-t border-white/[0.05]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,140,255,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-20 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
              Meet your new <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#6366F1] drop-shadow-[0_0_20px_rgba(79,140,255,0.3)]">digital workforce.</span>
            </h2>
            <p className="font-sans text-xl text-white/50 font-light leading-relaxed">
              Deploy specialized AI agents designed for enterprise workloads. Fully autonomous, secure, and compliant.
            </p>
          </div>
          <div className="hidden md:flex">
            <button className="font-sans px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors backdrop-blur-md">
              View All Agents
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] relative overflow-hidden group cursor-pointer backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:border-[#4F8CFF]/50 hover:shadow-[0_20px_40px_rgba(79,140,255,0.1)] transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <agent.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3 text-white tracking-tight">{agent.title}</h3>
                <p className="font-sans text-white/50 leading-relaxed font-light">
                  {agent.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
