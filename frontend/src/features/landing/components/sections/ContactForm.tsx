"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [inquiryType, setInquiryType] = useState("Company");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    
    // Append files to formData
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setFiles([]);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <section className="py-32 px-8 md:px-16 lg:px-24 bg-[#0B0B0B] relative" id="contact">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h2>
          <p className="text-[#B7B7B7] max-w-2xl mx-auto text-lg">
            Have questions about our Nexora AI agents? Want a custom demo? Send us a message.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[32px] p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-[rgba(212,175,55,0.1)] flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Message Sent!</h3>
              <p className="text-[#B7B7B7]">
                Thank you for reaching out. We will get back to you shortly.
              </p>
              <button 
                onClick={() => setStatus("idle")}
                className="mt-8 text-[#D4AF37] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">First Name</label>
                  <input required name="firstName" type="text" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Last Name</label>
                  <input required name="lastName" type="text" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="Doe" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email Address</label>
                <input required name="email" type="email" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="john@company.com" />
              </div>

              {/* Company / Personal Radio */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">Inquiry Type</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="inquiryType" value="Company" checked={inquiryType === "Company"} onChange={(e) => setInquiryType(e.target.value)} className="accent-[#D4AF37] w-4 h-4 cursor-pointer" />
                    <span className="text-[#B7B7B7] group-hover:text-white transition-colors">Company</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="inquiryType" value="Personal Work" checked={inquiryType === "Personal Work"} onChange={(e) => setInquiryType(e.target.value)} className="accent-[#D4AF37] w-4 h-4 cursor-pointer" />
                    <span className="text-[#B7B7B7] group-hover:text-white transition-colors">Personal Work</span>
                  </label>
                </div>
              </div>

              {/* Conditional Company Fields */}
              {inquiryType === "Company" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 md:p-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#D4AF37]">Company Name</label>
                    <input required name="companyName" type="text" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="Acme Inc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#D4AF37]">How many Employee works</label>
                    <div className="relative">
                      <select required name="employeeCount" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none">
                        <option value="" className="bg-[#0B0B0B]">Select an option</option>
                        <option value="1-10" className="bg-[#0B0B0B]">1-10</option>
                        <option value="11-50" className="bg-[#0B0B0B]">11-50</option>
                        <option value="51-200" className="bg-[#0B0B0B]">51-200</option>
                        <option value="201-500" className="bg-[#0B0B0B]">201-500</option>
                        <option value="500+" className="bg-[#0B0B0B]">500+</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#B7B7B7]">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Subject</label>
                <input required name="subject" type="text" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="How can we help?" />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Message</label>
                <textarea required name="message" rows={5} className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none" placeholder="Tell us more about your requirements..."></textarea>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Attachments (Screenshots / Screen Recordings)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] hover:bg-[rgba(212,175,55,0.02)] transition-all group"
                >
                  <UploadCloud className="w-8 h-8 text-[#B7B7B7] group-hover:text-[#D4AF37] mb-2 transition-colors" />
                  <p className="text-[#B7B7B7] text-sm text-center">Click to upload or drag and drop files</p>
                  <p className="text-white/40 text-xs mt-1">Images or Videos (max 10MB total recommended)</p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </div>
                
                {files.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between bg-[rgba(255,255,255,0.02)] p-2 rounded-lg text-sm text-[#B7B7B7]">
                        <span className="truncate max-w-[80%]">{f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300">Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Error Message */}
              {status === "error" && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <MagneticButton variant="primary" className="w-full !py-4 text-lg">
                  {status === "loading" ? "Sending..." : "Submit Message"}
                </MagneticButton>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
