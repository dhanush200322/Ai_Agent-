"use client";

import { motion } from "framer-motion";

const LOGOS = [
  "Microsoft", "Google", "AWS", "OpenAI", "Anthropic", 
  "Meta", "MongoDB", "Supabase", "Qdrant", "Stripe", 
  "Vercel", "Cloudflare"
];

export const TrustedBy = () => {
  return (
    <section className="py-20 border-y border-white/[0.08] bg-[#04070D] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#04070D] via-transparent to-[#04070D] z-10 pointer-events-none" />
      
      <div className="container mx-auto px-6 mb-10 text-center">
        <p className="font-sans text-sm font-semibold text-white/50 uppercase tracking-[0.2em]">
          Trusted by innovative engineering teams worldwide
        </p>
      </div>

      <div className="flex w-[200%] overflow-hidden relative">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
          className="flex w-1/2 justify-around items-center gap-16 px-8"
        >
          {LOGOS.map((logo, i) => (
            <div key={i} className="font-heading text-2xl font-bold text-white/20 hover:text-white/60 transition-colors cursor-default whitespace-nowrap drop-shadow-sm tracking-tight">
              {logo}
            </div>
          ))}
        </motion.div>
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
          className="flex w-1/2 justify-around items-center gap-16 px-8 absolute top-0 left-1/2"
        >
          {LOGOS.map((logo, i) => (
            <div key={i} className="font-heading text-2xl font-bold text-white/20 hover:text-white/60 transition-colors cursor-default whitespace-nowrap drop-shadow-sm tracking-tight">
              {logo}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
