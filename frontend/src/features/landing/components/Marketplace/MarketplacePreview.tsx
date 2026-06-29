"use client";

import { motion } from "framer-motion";
import { Copy, Star, Download } from "lucide-react";

export const MarketplacePreview = () => {
  return (
    <section className="py-24 relative bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Agent Marketplace
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't start from scratch. Use battle-tested templates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="h-32 rounded-xl bg-gradient-to-br from-white/10 to-transparent mb-4 flex items-center justify-center">
                <Copy className="w-8 h-8 text-white/40" />
              </div>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-white font-medium">4.9</span>
                <span className="text-sm text-muted-foreground ml-2">(120)</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">Sales Assistant V2</h3>
              <p className="text-sm text-muted-foreground mb-4">Connects Salesforce to Outreach.</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Free</span>
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
