"use client";

import React from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ArrowRight, Sparkles } from "lucide-react";
import CountUp from "react-countup";
import Link from "next/link";

export function HeroContent() {
  const headline = "Build Nexora AIs That Think. Learn. Automate.";
  const words = headline.split(" ");

  return (
    <div className="flex flex-col items-center text-center max-w-4xl pt-20 pb-12 relative z-10">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] text-[#D4AF37] text-sm font-medium mb-8"
      >
        <Sparkles className="w-4 h-4" />
        <span>Next Generation AI Platform</span>
      </motion.div>

      {/* Headline */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
        {words.map((word, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
            className="inline-block mr-3 lg:mr-4"
          >
            {word === "Think." || word === "Learn." || word === "Automate." ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F7D774]">
                {word}
              </span>
            ) : (
              word
            )}
          </motion.span>
        ))}
      </h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="text-lg md:text-xl text-[#B7B7B7] mb-10 max-w-2xl leading-relaxed"
      >
        Deploy intelligent AI Agents powered by RAG, Memory, Multi-Agent Workflows and Enterprise Integrations.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="flex flex-wrap items-center justify-center gap-4 mb-16"
      >
        <Link href="/register">
          <MagneticButton variant="primary">
            Start Building <ArrowRight className="w-4 h-4 ml-1" />
          </MagneticButton>
        </Link>
        <Link href="/demo">
          <MagneticButton variant="secondary">
            Book Demo
          </MagneticButton>
        </Link>
      </motion.div>

      {/* Stats/Counters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-[rgba(255,255,255,0.05)] w-full max-w-3xl"
      >
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-white mb-1">
            <CountUp end={500} duration={3} delay={1.5} />+
          </span>
          <span className="text-sm text-[#B7B7B7]">Companies</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-white mb-1">
            <CountUp end={1} duration={3} delay={1.5} />M+
          </span>
          <span className="text-sm text-[#B7B7B7]">Queries</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-white mb-1">
            <CountUp end={99.99} decimals={2} duration={3} delay={1.5} />%
          </span>
          <span className="text-sm text-[#B7B7B7]">Uptime</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-white mb-1">
            <CountUp end={250} duration={3} delay={1.5} />+
          </span>
          <span className="text-sm text-[#B7B7B7]">Integrations</span>
        </div>
      </motion.div>


    </div>
  );
}
