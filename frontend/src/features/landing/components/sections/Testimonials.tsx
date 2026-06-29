"use client";

import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "This platform has completely transformed how our engineering team builds AI products. The multi-agent orchestration is years ahead of the competition.",
    author: "Sarah Chen",
    role: "VP of Engineering at TechNova",
  },
  {
    quote: "Finally, an enterprise-grade solution that doesn't compromise on speed or security. Deploying RAG at this scale has never been easier.",
    author: "Michael Roberts",
    role: "Chief Architect, FinServe AI",
  },
  {
    quote: "The low latency edge network means our agents respond instantly. It feels like magic, but it's just incredible engineering.",
    author: "Elena Rodriguez",
    role: "Director of AI, Quantum Systems",
  }
];

export function Testimonials() {
  return (
    <section className="py-32 px-8 md:px-16 lg:px-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Trusted by Leaders</h2>
          <p className="text-[#B7B7B7] max-w-2xl mx-auto text-lg">
            See what the world's most innovative engineering teams are saying.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-3xl p-8 flex flex-col justify-between hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(212,175,55,0.2)] transition-all"
            >
              <div className="mb-8">
                {/* Gold Quote Marks */}
                <div className="text-5xl text-[#D4AF37] opacity-50 font-serif leading-none mb-2">"</div>
                <p className="text-lg text-white/90 leading-relaxed italic">{testimonial.quote}</p>
              </div>
              <div className="border-t border-[rgba(255,255,255,0.05)] pt-6 mt-auto">
                <p className="font-bold text-white">{testimonial.author}</p>
                <p className="text-[#B7B7B7] text-sm">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
