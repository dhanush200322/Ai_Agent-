"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 50);
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // smooth custom easing
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500 ${
        scrolled 
          ? "bg-[#04070D]/70 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.1)]" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#6366F1] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(79,140,255,0.4)]">
            <div className="absolute inset-0 bg-white/30 group-hover:translate-x-full transition-transform duration-700 ease-out -skew-x-12 -translate-x-full" />
            <div className="w-4 h-4 bg-[#04070D] rounded-sm z-10" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white hidden sm:block">AgentOS</span>
        </Link>
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/60">
          {["Product", "Solutions", "Enterprise", "Pricing", "Resources", "Docs"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors relative group py-2">
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#4F8CFF] to-[#0EA5E9] transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
          Login
        </Link>
        <Link href="/register">
          <MagneticButton>
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-full bg-white/5 border border-white/[0.08] hover:bg-white/10 transition-all overflow-hidden group shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(79,140,255,0.2)]"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#4F8CFF]/20 to-[#6366F1]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </MagneticButton>
        </Link>
      </div>
    </motion.nav>
  );
};
