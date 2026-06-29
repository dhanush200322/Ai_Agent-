"use client";

import React from "react";
import { AICoreScene } from "./scene/AICoreScene";
import { HeroContent } from "./HeroContent";

export function HeroV2() {
  return (
    <section className="relative w-full h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-[#050505] pt-16">
      {/* The 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <AICoreScene />
      </div>
      
      {/* Overlay Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 lg:px-24 flex justify-center text-center pointer-events-none">
        {/* pointer-events-none on container so 3D scene gets mouse events, but content will restore pointer-events */}
        <div className="pointer-events-auto w-full max-w-4xl flex flex-col items-center">
          <HeroContent />
        </div>
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#050505] to-transparent"></div>
      </div>

      {/* Global Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none opacity-50">
        <div className="w-[2px] h-12 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent animate-pulse"></div>
        <span className="text-[10px] uppercase tracking-widest mt-2 text-[#B7B7B7]">Scroll</span>
      </div>
    </section>
  );
}
