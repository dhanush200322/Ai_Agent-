"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Database, Bot, Zap, Rocket, LineChart } from "lucide-react";

const steps = [
  { title: "Lead Generation", desc: "Identify and qualify leads.", icon: Search },
  { title: "Knowledge Extraction", desc: "Process enterprise data.", icon: Database },
  { title: "Agent Processing", desc: "AI core executes reasoning.", icon: Bot },
  { title: "Automation Task", desc: "Trigger internal workflows.", icon: Zap },
  { title: "Deployment", desc: "Ship to production seamlessly.", icon: Rocket },
  { title: "Analytics & ROI", desc: "Measure agent performance.", icon: LineChart },
];

export const WorkflowTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const xTransform = useTransform(scrollYProgress, [0, 1], ["20%", "-40%"]);

  return (
    <section ref={containerRef} className="py-32 relative bg-[#04070D] border-t border-white/[0.05] overflow-hidden">
      <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-[#04070D] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#04070D] to-transparent z-20 pointer-events-none" />
      
      <div className="container mx-auto px-6 mb-20 relative z-30">
        <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          The Nexora AI Workflow
        </h2>
        <p className="font-sans text-xl text-white/50 max-w-2xl font-light">
          From data ingestion to autonomous execution in seconds.
        </p>
      </div>

      <div className="relative h-[400px] flex items-center">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#4F8CFF]/30 to-transparent -translate-y-1/2 z-0" />
        
        <motion.div style={{ x: xTransform }} className="flex gap-16 px-32 relative z-10 w-max">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center w-64 text-center group">
              <div className="w-24 h-24 rounded-full bg-[#04070D] border border-white/[0.08] flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(79,140,255,0.2)] group-hover:shadow-[0_0_40px_rgba(159,92,255,0.4)] relative transition-all duration-500 z-10">
                <step.icon className="w-10 h-10 text-[#4F8CFF] group-hover:text-[#0EA5E9] transition-colors drop-shadow-[0_0_15px_currentColor]" />
                <div className="absolute -inset-4 rounded-full border border-white/[0.05] group-hover:border-[#6366F1]/30 animate-[spin_10s_linear_infinite] transition-colors duration-500" />
                <div className="absolute -inset-8 rounded-full border border-white/[0.02] group-hover:border-[#4F8CFF]/20 animate-[spin_15s_linear_infinite_reverse] transition-colors duration-500" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3 text-white tracking-tight">{step.title}</h3>
              <p className="font-sans text-white/50 text-sm leading-relaxed font-light">{step.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
