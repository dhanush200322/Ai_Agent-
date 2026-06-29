"use client";

import React from "react";
import { Twitter, Github, Linkedin, ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Footer() {
  return (
    <footer className="bg-[#050505] pt-24 pb-12 px-8 md:px-16 lg:px-24 border-t border-[rgba(255,255,255,0.05)] relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D4AF37] opacity-5 blur-[150px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
          
          {/* Brand & Newsletter (Takes 2 cols) */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Enterprise AI<span className="text-[#D4AF37]">.</span></h2>
            <p className="text-[#B7B7B7] mb-8 max-w-sm">
              The platform for building, deploying, and scaling autonomous AI agents.
            </p>
            
            <div className="mb-6">
              <h3 className="text-white font-medium mb-4">Subscribe to our newsletter</h3>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] w-full"
                />
                <button className="bg-[rgba(212,175,55,0.1)] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050505] px-4 rounded-xl transition-colors flex items-center justify-center">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Product</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Agents</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Workflows</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Integrations</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Enterprise</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Resources</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Documentation</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">API Reference</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Blog</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Community</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">System Status</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Company</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">About Us</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Careers</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Security</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[rgba(255,255,255,0.05)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#B7B7B7] text-sm">
            © {new Date().getFullYear()} Enterprise AI Inc. All rights reserved.
          </p>
          
          <div className="flex gap-4">
            <a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors p-2 bg-[rgba(255,255,255,0.02)] rounded-full">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors p-2 bg-[rgba(255,255,255,0.02)] rounded-full">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#B7B7B7] hover:text-[#D4AF37] transition-colors p-2 bg-[rgba(255,255,255,0.02)] rounded-full">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
