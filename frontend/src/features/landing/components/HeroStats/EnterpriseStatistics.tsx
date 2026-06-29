"use client";

import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

const stats = [
  { value: 10000, suffix: "+", label: "Agents Created" },
  { value: 500, suffix: "+", label: "Enterprise Customers" },
  { value: 99.99, suffix: "%", label: "Platform Uptime", decimals: 2 },
  { value: 150, suffix: "+", label: "Integrations" },
];

export const EnterpriseStatistics = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden bg-[#04070D]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#4F8CFF]/50 to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md relative group overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:bg-white/[0.04] transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#4F8CFF]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#4F8CFF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="font-mono text-4xl md:text-5xl font-bold text-white mb-3 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {inView ? (
                  <CountUp 
                    end={stat.value} 
                    duration={2.5} 
                    decimals={stat.decimals || 0} 
                    separator="," 
                  />
                ) : "0"}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#0EA5E9] font-sans">
                  {stat.suffix}
                </span>
              </div>
              <div className="font-sans text-xs md:text-sm font-semibold text-white/50 uppercase tracking-[0.15em]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
