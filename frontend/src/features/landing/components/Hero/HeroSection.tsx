"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import dynamic from "next/dynamic";
import { ShieldCheck, Zap, Lock, Cpu } from "lucide-react";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HeroSkeleton } from "./HeroSkeleton";

// Dynamically import the 3D scene (Client-only to avoid hydration errors & save initial bundle)
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <HeroSkeleton />
});

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const springConfig = { stiffness: 100, damping: 30, bounce: 0 };
  const yTextSpring = useSpring(yText, springConfig);

  return (
    <section ref={containerRef} className="relative w-full h-screen min-h-[800px] flex items-center pt-20 overflow-hidden bg-[#04070D]">
      {/* Cinematic Looping Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Noise overlay for cinematic film grain feel */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-10" />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#4F8CFF]/20 blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#6366F1]/20 blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[30vw] rounded-full bg-[#0EA5E9]/15 blur-[100px]"
        />
      </div>

      <Scene />

      <div className="container relative z-30 mx-auto px-6 pointer-events-auto">
        <motion.div 
          style={{ y: yTextSpring, opacity: opacityText }}
          className="max-w-4xl relative"
        >
          {/* subtle grid pattern overlay for premium tech feel */}
          <div className="absolute -inset-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
              <span className="text-xs font-mono font-medium tracking-wide text-white/70 uppercase">AgentOS Platform 2.0</span>
            </div>
            
            <h1 className="font-heading text-[56px] md:text-[80px] leading-[1.05] font-bold tracking-tight mb-8 text-white">
              Build Enterprise AI Agents <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] via-[#6366F1] to-[#0EA5E9] drop-shadow-[0_0_30px_rgba(159,92,255,0.3)]">
                That Think. Learn. Scale.
              </span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-[18px] md:text-[22px] text-white/60 leading-relaxed mb-10 max-w-2xl font-light"
          >
            Create production-ready AI agents powered by your existing enterprise infrastructure. 
            Deploy intelligent workflows, RAG systems, memory, automation, and integrations from one unified platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-5 mb-16"
          >
            <Link href="/register">
              <MagneticButton>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-[#04070D] font-sans font-semibold rounded-full hover:bg-white/90 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.8)]"
                >
                  Start Building
                </motion.button>
              </MagneticButton>
            </Link>
            
            <MagneticButton>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white/[0.03] border border-white/[0.08] text-white font-sans font-medium rounded-full hover:bg-white/[0.08] transition-all backdrop-blur-xl"
              >
                Book Enterprise Demo
              </motion.button>
            </MagneticButton>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap items-center gap-8 font-sans text-sm font-medium text-white/40"
          >
            {[
              { icon: ShieldCheck, text: "SOC2 Ready", color: "text-[#4F8CFF]" },
              { icon: Lock, text: "Enterprise Grade", color: "text-[#6366F1]" },
              { icon: Zap, text: "API First", color: "text-[#0EA5E9]" },
              { icon: Cpu, text: "Open Architecture", color: "text-[#4F8CFF]" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -2, color: "rgba(255,255,255,0.8)" }}
                className="flex items-center gap-2 cursor-default transition-colors"
              >
                <item.icon className={`w-5 h-5 ${item.color} drop-shadow-[0_0_10px_currentColor]`} />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-none"
      >
        <div className="w-[30px] h-[50px] rounded-full border border-white/10 flex justify-center p-1 bg-white/[0.02] backdrop-blur-md">
          <motion.div 
            animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          />
        </div>
      </motion.div>
    </section>
  );
};
