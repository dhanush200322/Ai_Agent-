"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "py-4 bg-[rgba(5,5,5,0.7)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.05)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
          : "py-6 bg-transparent"
      }`}
    >
      <div className="w-full px-8 md:px-12 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 animate-coin-flip">
            <img src="/logo.png" alt="Nexora Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Nexora AI<span className="text-[#D4AF37]">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-[#B7B7B7] hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#workflow" className="text-sm font-medium text-[#B7B7B7] hover:text-white transition-colors">
            Workflow
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-[#B7B7B7] hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-white hover:text-[#D4AF37] transition-colors">
            Login
          </Link>
          <Link href="/register">
            <MagneticButton variant="primary" className="!px-6 !py-2.5 !text-sm">
              Get Started
            </MagneticButton>
          </Link>
        </div>
        
      </div>
    </motion.header>
  );
}
