"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  { question: "How does the pricing scale?", answer: "Pricing is based on active agents and LLM tokens. Enterprise plans offer volume discounts." },
  { question: "Can I deploy on-premise?", answer: "Yes, our enterprise plan supports full VPC and bare-metal deployments for maximum security." },
  { question: "What LLMs are supported?", answer: "We support OpenAI, Anthropic, local Llama models, and custom fine-tuned endpoints." },
  { question: "Is my data used for training?", answer: "Absolutely not. We maintain strict SOC2 compliance and zero-data-retention policies." },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-32 relative bg-[#04070D]">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-white/[0.08] rounded-2xl bg-white/[0.02] overflow-hidden backdrop-blur-sm"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-heading text-lg font-bold text-white">{faq.question}</span>
                <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">
                  {openIndex === i ? (
                    <Minus className="w-4 h-4 text-[#0EA5E9]" />
                  ) : (
                    <Plus className="w-4 h-4 text-white/50" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-6 font-sans text-white/50 font-light leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
