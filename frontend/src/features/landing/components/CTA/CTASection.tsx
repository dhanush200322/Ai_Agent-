"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";

export const CTASection = () => {
  return (
    <section className="py-40 relative overflow-hidden flex items-center justify-center bg-[#04070D]">
      <div className="absolute inset-0 bg-[#4F8CFF]/10 blur-[150px] pointer-events-none rounded-full scale-150 transform-gpu" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-10 max-w-4xl mx-auto leading-tight text-white"
        >
          Ready to Build <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#0EA5E9] drop-shadow-[0_0_30px_rgba(79,140,255,0.4)]">Enterprise AI?</span>
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/register">
            <MagneticButton>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-white text-[#04070D] font-bold rounded-full hover:bg-white/90 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.6)] w-full sm:w-auto"
              >
                Start Building
              </motion.button>
            </MagneticButton>
          </Link>
          <MagneticButton>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-white/[0.03] border border-white/[0.08] text-white font-bold rounded-full hover:bg-white/10 transition-all backdrop-blur-xl w-full sm:w-auto shadow-[0_0_20px_rgba(0,0,0,0.2)]"
            >
              Book Enterprise Demo
            </motion.button>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
};
