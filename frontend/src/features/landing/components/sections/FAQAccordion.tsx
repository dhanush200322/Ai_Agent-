"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How secure is my enterprise data?",
    answer: "Security is our top priority. We are SOC2 Type II compliant, offer end-to-end encryption, and provide options for on-premises deployment or dedicated single-tenant VPCs. Your data is never used to train our base models."
  },
  {
    question: "Can I connect my own custom models?",
    answer: "Yes. Our platform is model-agnostic. You can bring your own fine-tuned models, use any OpenAI/Anthropic model, or deploy open-source models via our edge infrastructure."
  },
  {
    question: "How do multi-agent workflows operate?",
    answer: "You define specialized agents (e.g., a Researcher, a Coder, a Reviewer) and orchestrate them using our visual workflow builder or YAML configs. They can communicate, share context, and debate until a consensus is reached."
  },
  {
    question: "What is the typical latency?",
    answer: "Our global edge network ensures routing latency is under 50ms. Total latency depends on the LLM being used, but our proprietary caching layer often reduces repetitive query times by up to 80%."
  }
];

export function FAQAccordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-32 px-8 md:px-16 lg:px-24 bg-[#050505]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isActive = activeIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`border rounded-2xl overflow-hidden transition-colors ${
                  isActive ? "bg-[rgba(255,255,255,0.04)] border-[rgba(212,175,55,0.3)]" : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-bold text-white">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: isActive ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 ml-4 ${isActive ? "text-[#D4AF37]" : "text-[#B7B7B7]"}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-[#B7B7B7] leading-relaxed border-t border-[rgba(255,255,255,0.05)] pt-4 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
