"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Database, Bot, Zap, ArrowRight, Layers } from "lucide-react";

export function AgentWorkflow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const pathLength = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  const steps = [
    {
      title: "Connect Data",
      description: "Integrate with your existing enterprise knowledge bases, APIs, and SaaS tools via secure RAG pipelines.",
      icon: <Database className="w-6 h-6 text-[#D4AF37]" />,
    },
    {
      title: "Orchestrate Agents",
      description: "Define multi-agent workflows where specialized models collaborate, debate, and verify each other's outputs.",
      icon: <Layers className="w-6 h-6 text-[#D4AF37]" />,
    },
    {
      title: "Deploy & Automate",
      description: "Launch agents into production with SOC2-compliant logging, human-in-the-loop approvals, and seamless execution.",
      icon: <Zap className="w-6 h-6 text-[#D4AF37]" />,
    },
  ];

  return (
    <section ref={containerRef} className="py-32 px-8 md:px-16 lg:px-24 bg-[#050505] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How it works</h2>
          <p className="text-[#B7B7B7] max-w-2xl mx-auto text-lg">
            From raw unstructured data to autonomous actions in production.
          </p>
        </div>

        <div className="relative">
          {/* SVG Connecting Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 hidden md:block">
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(212,175,55,0.2)" strokeWidth="2" strokeDasharray="8 8" />
              <motion.line
                x1="50%"
                y1="0"
                x2="50%"
                y2="100%"
                stroke="#D4AF37"
                strokeWidth="2"
                style={{ pathLength }}
              />
            </svg>
          </div>

          <div className="space-y-24 md:space-y-32">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className={`flex flex-col md:flex-row items-center justify-between w-full ${isEven ? "md:flex-row-reverse" : ""}`}>
                  {/* Empty space for alternating layout */}
                  <div className="hidden md:block w-[45%]"></div>
                  
                  {/* Node */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-[#0B0B0B] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] mb-8 md:mb-0">
                    {step.icon}
                  </div>

                  {/* Content Box */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="w-full md:w-[45%] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-3xl p-8 backdrop-blur-sm"
                  >
                    <div className="text-sm text-[#D4AF37] font-bold tracking-widest mb-2">STEP 0{idx + 1}</div>
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-[#B7B7B7]">{step.description}</p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
