"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150 && !isMobileMenuOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 50);
  });

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  const navLinks = ["Product", "Solutions", "Enterprise", "Pricing", "Resources", "Docs"];

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 md:px-6 py-4 transition-all duration-500 ${
          scrolled 
            ? "bg-[#04070D]/70 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.1)]" 
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0 animate-coin-flip">
              <img src="/logo.png" alt="Nexora Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white hidden sm:block">Nexora AI</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/60">
            {navLinks.map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors relative group py-2">
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#4F8CFF] to-[#0EA5E9] transition-all duration-300 group-hover:w-full rounded-full" />
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-6">
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

        {/* Mobile Menu Toggle */}
        <div className="flex lg:hidden items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white/80 hover:text-white p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#04070D] lg:hidden pt-24 px-6 pb-6 overflow-y-auto flex flex-col"
          >
            <div className="flex flex-col gap-6 mb-8 text-lg font-medium text-white/80">
              {navLinks.map((item) => (
                <Link 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-white transition-colors py-2 border-b border-white/10"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-4 mt-auto">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 text-center text-white/80 hover:text-white font-medium bg-white/5 rounded-xl border border-white/10"
              >
                Login
              </Link>
              <Link 
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 text-center text-white font-semibold bg-gradient-to-r from-[#4F8CFF] to-[#6366F1] rounded-xl shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
