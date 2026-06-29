"use client";

import React from "react";
import { motion } from "framer-motion";

const integrationNames = [
  "GitHub", "Google", "Slack", "Notion", "OpenAI", 
  "Anthropic", "AWS", "Azure", "Docker", "Supabase", 
  "PostgreSQL", "Qdrant", "Pinecone", "Stripe", "Vercel", "Cloudflare"
];

export function IntegrationsCarousel() {
  return (
    <section className="py-24 bg-[#0B0B0B] border-y border-[rgba(255,255,255,0.05)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 mb-12 text-center">
        <h2 className="text-sm font-bold tracking-widest text-[#B7B7B7] uppercase">250+ Enterprise Integrations</h2>
      </div>

      <div className="relative flex overflow-x-hidden">
        {/* Left Fade */}
        <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-[#0B0B0B] to-transparent z-10"></div>
        
        {/* Carousel Content */}
        <div className="flex animate-[scroll_40s_linear_infinite] whitespace-nowrap">
          {[...integrationNames, ...integrationNames, ...integrationNames].map((name, idx) => (
            <div
              key={idx}
              className="mx-6 px-8 py-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl flex items-center justify-center hover:bg-[rgba(212,175,55,0.05)] hover:border-[rgba(212,175,55,0.2)] transition-colors cursor-pointer"
            >
              <span className="text-xl font-medium text-white/80">{name}</span>
            </div>
          ))}
        </div>

        {/* Right Fade */}
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#0B0B0B] to-transparent z-10"></div>
      </div>
    </section>
  );
}
