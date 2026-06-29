"use client";

import { Shield, Lock, FileKey, CheckCircle } from "lucide-react";

const features = [
  { icon: Shield, title: "SOC 2 Type II", desc: "Audited and certified." },
  { icon: Lock, title: "End-to-End Encryption", desc: "AES-256 at rest, TLS 1.3 in transit." },
  { icon: FileKey, title: "BYOK", desc: "Bring your own keys for maximum control." },
];

export const SecurityCompliance = () => {
  return (
    <section className="py-24 relative bg-background border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Bank-grade security. <br />
              <span className="text-primary">Enterprise control.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              We never train on your data. AgentOS provides isolated environments, role-based access control, and full audit logs.
            </p>
            <div className="space-y-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">{f.title}</h4>
                    <p className="text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay rounded-3xl" />
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle className="text-green-500 w-6 h-6" /> Data Privacy Guarantee
              </h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> No training on customer data
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Data sovereignty in EU/US regions
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> GDPR & HIPAA Compliant
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Automated PII redaction
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
